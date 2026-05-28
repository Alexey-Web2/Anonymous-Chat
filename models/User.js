const mongoose = require("mongoose");

const UserSchema =
    new mongoose.Schema({

        username: {
            type: String,
            unique: true
        },

        socketId: String,

        online: {
            type: Boolean,
            default: false
        },

        // БАН
        banned: {
            type: Boolean,
            default: false
        },

        // ПРЕДУПРЕЖДЕНИЯ
        warnings: [
            {
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]

    });

module.exports =
    mongoose.model(
        "User",
        UserSchema
    );