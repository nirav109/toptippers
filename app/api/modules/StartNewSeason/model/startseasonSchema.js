'use strict';
var mongoose = require('mongoose')

var seasonsSchema = new mongoose.Schema({
    seasonname: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true

    },
    sport: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sport',
    }],
    isActive: {
        type: Boolean,

    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
var seasons = mongoose.model('seasons', seasonsSchema);
module.exports = seasons;