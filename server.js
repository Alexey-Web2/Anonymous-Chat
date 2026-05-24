require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const User = require("./models/User");
const Message = require("./models/Message");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((err) => {
    console.error(err);
});

// ======================
// ДАННЫЕ ОНЛАЙН / ПОИСК
// ======================

let waitingUsers = [];
const activeRooms = {};

// ======================
// SOCKET
// ======================

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    // ======================
    // LOGIN
    // ======================

    socket.on("login", async (username) => {

        try {

            let user = await User.findOne({ username });

            if (!user) {
                user = await User.create({ username });
            }

            user.online = true;
            user.socketId = socket.id;

            await user.save();

            socket.username = username;

            // 👉 ВСЕ сообщения остаются навсегда
            const messages = await Message.find({
                to: username
            });

            socket.emit("messages", messages);

        } catch (err) {
            console.error(err);
        }

    });

    // ======================
    // ПОИСК СОБЕСЕДНИКА
    // ======================

    socket.on("findPartner", () => {

        if (waitingUsers.includes(socket)) return;

        waitingUsers.push(socket);

        if (waitingUsers.length >= 2) {

            const user1 = waitingUsers.shift();
            const user2 = waitingUsers.shift();

            const room = "room_" + Date.now();

            user1.join(room);
            user2.join(room);

            user1.room = room;
            user2.room = room;

            activeRooms[room] = {
                users: [user1.id, user2.id]
            };

            io.to(room).emit("chatStarted");
        }

    });

    // ======================
    // СООБЩЕНИЯ В ЧАТЕ
    // ======================

    socket.on("chatMessage", (text) => {

        if (!socket.room) return;

        // 🔥 ВАЖНО: отправляем ВСЕМ КРОМЕ ОТПРАВИТЕЛЯ
        socket.to(socket.room).emit("chatMessage", {
            sender: socket.username,
            text
        });

    });

    // ======================
    // ВЫХОД ИЗ ЧАТА
    // ======================

    socket.on("leaveChat", () => {

        if (!socket.room) return;

        const room = socket.room;

        io.to(room).emit("chatClosed");

        delete activeRooms[room];

        socket.room = null;
    });

    // ======================
    // ЛИЧНЫЕ СООБЩЕНИЯ
    // ======================

    socket.on("sendPrivateMessage", async (data) => {

        try {

            const target = await User.findOne({
                username: data.to
            });

            if (!target) {
                socket.emit("userNotFound");
                return;
            }

            await Message.create({
                from: socket.username,
                to: data.to,
                text: data.text
            });

            // если онлайн — сразу пуш
            if (target.online && target.socketId) {

                io.to(target.socketId).emit(
                    "newPrivateMessage",
                    {
                        from: socket.username,
                        text: data.text
                    }
                );
            }

            socket.emit("privateSent");

        } catch (err) {
            console.error(err);
        }

    });

    // ======================
    // DISCONNECT
    // ======================

    socket.on("disconnect", async () => {

        console.log("Disconnected:", socket.id);

        if (socket.username) {

            await User.updateOne(
                { username: socket.username },
                { online: false }
            );

        }

        waitingUsers = waitingUsers.filter(
            u => u.id !== socket.id
        );

        if (socket.room) {

            io.to(socket.room).emit("chatClosed");

            delete activeRooms[socket.room];
        }

    });

});

// ======================
// START
// ======================

server.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});