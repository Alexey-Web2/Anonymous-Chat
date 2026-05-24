const mongoose = require("mongoose");

const SupportConversationSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },

    active: {
        type: Boolean,
        default: true
    },

    unreadForAdmin: {
        type: Number,
        default: 0
    },

    unreadForUser: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "SupportConversation",
    SupportConversationSchema
);