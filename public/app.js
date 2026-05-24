// ======================
// SOCKET.IO
// ======================

const socket = io();

// ======================
// ЭЛЕМЕНТЫ
// ======================

const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const chatPage = document.getElementById("chatPage");

const actionsModal = document.getElementById("actionsModal");
const searchModal = document.getElementById("searchModal");
const messageModal = document.getElementById("messageModal");
const profileModal = document.getElementById("profileModal");
const closeChatModal = document.getElementById("closeChatModal");

const usernameInput = document.getElementById("usernameInput");
const profileUsername = document.getElementById("profileUsername");
const avatar = document.getElementById("avatar");

const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const messagesContainer = document.getElementById("messagesContainer");
const toast = document.getElementById("errorToast");

// ======================
// ДАННЫЕ
// ======================

let currentUser = null;
let loggedIn = false;

// ======================
// LOGIN
// ======================

function login() {

    const username = usernameInput.value.trim();

    if (!username) {
        showToast("Введите username");
        return;
    }

    if (loggedIn) return;

    currentUser = username.startsWith("@")
        ? username
        : "@" + username;

    localStorage.setItem("username", currentUser);

    profileUsername.textContent = currentUser;

    avatar.textContent = currentUser
        .replace("@", "")
        .charAt(0)
        .toUpperCase();

    loginPage.classList.add("hidden");
    homePage.classList.remove("hidden");

    loggedIn = true;

    socket.emit("login", currentUser);
}

// ======================
// ЗАГРУЗКА СЕССИИ
// ======================

window.addEventListener("load", () => {

    const saved = localStorage.getItem("username");

    if (saved) {

        currentUser = saved;
        loggedIn = true;

        profileUsername.textContent = saved;

        avatar.textContent = saved
            .replace("@", "")
            .charAt(0)
            .toUpperCase();

        loginPage.classList.add("hidden");
        homePage.classList.remove("hidden");

        socket.emit("login", currentUser);
    }
});

// ======================
// ПОИСК СОБЕСЕДНИКА
// ======================

function startSearch() {

    closeActions();

    searchModal.classList.remove("hidden");

    socket.emit("findPartner");
}

function cancelSearch() {

    searchModal.classList.add("hidden");

    socket.emit("leaveChat");
}

// ======================
// ЧАТ НАЧАЛСЯ
// ======================

socket.on("chatStarted", () => {

    searchModal.classList.add("hidden");

    openChat();

});

// ======================
// ОТКРЫТЬ ЧАТ
// ======================

function openChat() {

    chatMessages.innerHTML = "";

    chatPage.classList.remove("hidden");

    addSystemMessage("Собеседник найден 👤");
}

// ======================
// СООБЩЕНИЯ В ЧАТЕ
// ======================

function sendMessage() {

    const text = chatInput.value.trim();

    if (!text) return;

    addMyMessage(text);

    socket.emit("chatMessage", text);

    chatInput.value = "";
}

// пришло сообщение
socket.on("chatMessage", (data) => {

    addPartnerMessage(data.text);

});

// чат закрыт
socket.on("chatClosed", () => {

    chatPage.classList.add("hidden");

    showToast("Чат завершён");

});

// ======================
// UI СООБЩЕНИЯ
// ======================

function addMyMessage(text) {

    const div = document.createElement("div");

    div.className = "message my-message";
    div.textContent = text;

    chatMessages.appendChild(div);

    scrollChat();
}

function addPartnerMessage(text) {

    const div = document.createElement("div");

    div.className = "message";
    div.textContent = text;

    chatMessages.appendChild(div);

    scrollChat();
}

function addSystemMessage(text) {

    const div = document.createElement("div");

    div.className = "message system-message";
    div.textContent = text;

    chatMessages.appendChild(div);

    scrollChat();
}

function scrollChat() {

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// ======================
// ЛИЧНЫЕ СООБЩЕНИЯ
// ======================

function sendPrivateMessage() {

    const target = document.getElementById("targetUser");
    const message = document.getElementById("messageText");

    const username = target.value.trim();
    const text = message.value.trim();

    if (!username) {
        showToast("Введите username");
        return;
    }

    if (!text) {
        showToast("Введите сообщение");
        return;
    }

    socket.emit("sendPrivateMessage", {
        to: username.startsWith("@") ? username : "@" + username,
        text: text
    });

    target.value = "";
    message.value = "";

    closeMessageModal();

    showToast("Сообщение отправлено");
}

// ======================
// ВХОДЯЩИЕ СООБЩЕНИЯ (ГЛАВНЫЙ ЭКРАН)
// ======================

socket.on("messages", (msgs) => {

    msgs.forEach(msg => {
        addInboxMessage(msg.text);
    });

});

// добавление в inbox
function addInboxMessage(text) {

    const div = document.createElement("div");

    div.className = "inbox-message";

    // ❗ без имени отправителя
    div.textContent = text;

    messagesContainer.appendChild(div);
}

// ======================
// ПУШ ЛИЧНОГО СООБЩЕНИЯ
// ======================

socket.on("newPrivateMessage", (data) => {

    showToast("📩 Новое сообщение");

    addInboxMessage(data.text);
});

// ======================
// УСПЕШНАЯ ОТПРАВКА
// ======================

socket.on("privateSent", () => {
    showToast("✔ Отправлено");
});

// ======================
// ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН
// ======================

socket.on("userNotFound", () => {
    showToast("Пользователь не найден");
});

// ======================
// ПРОФИЛЬ
// ======================

function openProfile() {
    profileModal.classList.remove("hidden");
}

// ======================
// ВЫХОД
// ======================

function logout() {

    localStorage.removeItem("username");

    socket.disconnect();

    location.reload();
}

// ======================
// МОДАЛКИ
// ======================

function openActions() {
    actionsModal.classList.remove("hidden");
}

function closeActions() {
    actionsModal.classList.add("hidden");
}

function openMessageModal() {
    messageModal.classList.remove("hidden");
}

function closeMessageModal() {
    messageModal.classList.add("hidden");
}

function openCloseChatModal() {
    closeChatModal.classList.remove("hidden");
}

function closeCloseModal() {
    closeChatModal.classList.add("hidden");
}

// ======================
// ЗАВЕРШЕНИЕ ЧАТА
// ======================

function endChat() {

    socket.emit("leaveChat");

    chatPage.classList.add("hidden");

    closeChatModal.classList.add("hidden");

    showToast("Чат завершён");
}

// ======================
// TOAST
// ======================

function showToast(text) {

    toast.textContent = text;
    toast.classList.remove("hidden");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2500);
}

// ======================
// ENTER ОБРАБОТКА
// ======================

chatInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }

});

usernameInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        login();
    }

});