'use strict';
var mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
    isTesting:{
        type: Boolean,
        default: false
    },
    currentDate: {
        type: String
    },
    type: {
        type: String
    }
}, {
    timestamps: true
})
var setting = mongoose.model('setting', settingSchema);
module.exports = setting;