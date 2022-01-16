'use strict';
var mongoose = require('mongoose');

var compSchema = new mongoose.Schema({
    competitionname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sport',
        required: true
    },
    // bonus: [{
    //     bonusId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'bonus',
    //     },
    //     bonusquantity: {
    //         type: Number,
    //         required: false
    //     }
    // }],
    bonus2xpoint: {
        type: Number,
        required: false
    },
    bonus3xpoint: {
        type: Number,
        required: false
    },
    bonuspoint: {
        type: Number,
        required: false
    },
    heaterBonus: {
        type: Boolean,
        required: true
    },
    smugTipBonus: {
        type: Boolean,
        required: true
    },
    finalFrenzyBonus: {
        type: Boolean,
        required: true
    },
    kingbot: {
        type: Boolean,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isPublic: {
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
var comp = mongoose.model('comp', compSchema);
module.exports = comp;