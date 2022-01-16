'use strict';
var mongoose = require('mongoose');

var roundSchema = new mongoose.Schema({
    roundno: {
        type: Number,
        required: true
    },
    roundname: {
        type: String,
        required: true
    },
    roundtype: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sport',
    },
    // season: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'seasons',
    // },
    isDeleted: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    }
}, {
    timestamps: true
})
var round = mongoose.model('round', roundSchema);
module.exports = round;