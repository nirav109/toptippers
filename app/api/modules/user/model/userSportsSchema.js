'use strict';
var mongoose = require('mongoose')

var usersportsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    sport: [{
        type: mongoose.Schema.Types.ObjectId,
        isSelected: true,
        required: true,

    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var usersports = mongoose.model("usersports", usersportsSchema);
module.exports = usersports;