'use strict';
var mongoose = require('mongoose');

var deviceSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var device = mongoose.model('device', deviceSchema);
module.exports = device;