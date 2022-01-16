'use strict';
var mongoose = require('mongoose');

var contentSchema = new mongoose.Schema({
    contentType: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var content = mongoose.model('content', contentSchema);
module.exports = content;