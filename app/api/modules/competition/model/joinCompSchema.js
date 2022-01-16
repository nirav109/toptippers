'use strict';
var mongoose = require('mongoose');

var joincompSchema = new mongoose.Schema({
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comp',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    seasonPoints:{
        type: Number,
        required: false,
        default: 0
    },
    currentRoundPoints: {
        type: Number,
        required: false,
        default: 0
    },
    previousRoundPoints: {
        type: Number,
        required: false,
        default: 0
    },
    heaterBonus: {
        type: Number,
        required: false,
        default: 0
    },
    position: {
        type: Number,
        required: false,
        default: 0
    },
    isJoined: {
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
var joincomp = mongoose.model('joincomp', joincompSchema);
module.exports = joincomp;