 'use strict';
 var mongoose = require('mongoose');

 var teamSchema = new mongoose.Schema({
     teamname: {
         type: String,
         required: true
     },
     teamLogo: {
         type: String,
         // required: true
     },
     isActive: {
         type: Boolean,
         default: true
     },
     isDeleted: {
         type: Boolean,
         default: false
     },
     sport: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'sport',
     },
     seasonId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'seasons',
     }
 }, {
     timestamps: true
 })
 var team = mongoose.model('team', teamSchema);
 module.exports = team;