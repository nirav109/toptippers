'use strict';
var mongoose = require('mongoose');

var tippingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    game:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'game',
        required: true
    },
    bettingTeam:{
        type: String,
        enum: ['home', 'away'],
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var tipping = mongoose.model('tipping', tippingSchema);
module.exports = tipping;