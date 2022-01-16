'use strict';
var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
    rolename: {
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
var role = mongoose.model('role', roleSchema);
module.exports = role;