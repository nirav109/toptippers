'use strict';
var mongoose = require('mongoose');

var userBonusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    round:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'round',
        required: true
    },
    comp:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comp',
        required: true
    },
    currentBonus:{
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var userBonus = mongoose.model('userBonus', userBonusSchema);
module.exports = userBonus;