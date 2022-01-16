'use strict';

var mongoose = require('mongoose');

var emailTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    template_code: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('emailTemplate', emailTemplateSchema);