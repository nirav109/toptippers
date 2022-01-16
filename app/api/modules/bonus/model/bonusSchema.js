'use strict';
var mongoose = require('mongoose');

var bonusSchema = new mongoose.Schema({
    bonusname: {
        type: String,
        required: true
    },
    description:{
        type: String,       
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var bonus = mongoose.model('bonus', bonusSchema);
module.exports = bonus;