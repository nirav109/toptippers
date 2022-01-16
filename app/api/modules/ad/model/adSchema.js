'use strict';
var mongoose = require('mongoose');

var adSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    media: {
        type: String,
    },
    type: {
        type: String,
    },
    mediaType: {
        type: String,
        enum: ['image', 'gif', 'video']
    },
    redirectUrl: {
        type: String,
    },
    isActive: {
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
var ad = mongoose.model('ad', adSchema);
module.exports = ad;