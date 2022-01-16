'use strict';
var mongoose = require('mongoose');

var topicSchema = new mongoose.Schema({
    topicname: {
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
var topic = mongoose.model('topic', topicSchema);
module.exports = topic;