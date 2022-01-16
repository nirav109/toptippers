'use strict';
var mongoose = require('mongoose');

var aduserSchema = new mongoose.Schema({
    ad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ad',
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
        
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var aduser = mongoose.model('aduser', aduserSchema);
module.exports = aduser;