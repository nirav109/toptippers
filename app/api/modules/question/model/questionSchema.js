'use strict';
var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'topic',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var question = mongoose.model('question', questionSchema);
module.exports = question;