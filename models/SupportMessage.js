const mongoose = require("mongoose");

const SupportMessageSchema = new mongoose.Schema({

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupportConversation",
        required: true
    },

    sender: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "SupportMessage",
    SupportMessageSchema
);