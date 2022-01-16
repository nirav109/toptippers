'use strict';
var mongoose = require('mongoose');

var sportSchema = new mongoose.Schema({
    sportname: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var role = mongoose.model('sport', sportSchema);
module.exports = role;