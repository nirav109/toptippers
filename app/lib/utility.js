'use strict';
/*
 * Utility - utility.js
 * Author: smartData Enterprises
 * Date: 27th Nov 2019
 */
// var config = require('../../config/config').get(process.env.NODE_ENV || 'staging');

var utility = {};
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var moment = require('moment');

utility.hashPassword = function(password) {
    if (password) {
        return bcrypt.hashSync(password, salt);
    }
    return '';
}

utility.generateRandomString = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var timestamp = new Date().getTime();

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return String(timestamp) + text;

}

utility.removeOffset = function removeOffset(dobFormat) {
    // console.log("RemoveOffset: ", dobFormat)
    var userOffset = new Date(dobFormat).getTimezoneOffset();
    var userOffsetMilli = userOffset * 60 * 1000;
    //var dateInMilli = moment(new Date(dobFormat)).unix()*1000
    var dateInMilli = moment(new Date(dobFormat)).valueOf();
    var dateInUtc = !isNaN(userOffsetMilli) ? dateInMilli - userOffsetMilli : "";
    return dateInUtc;
};

utility.addOffset = function addOffset(dobFormat) {
    var userOffset = new Date(dobFormat).getTimezoneOffset();
    var userOffsetMilli = userOffset * 60 * 1000;
    //var dateInMilli = moment(dobFormat).unix()*1000
    var dateInMilli = moment(new Date(dobFormat)).valueOf();
    var dateInUtc = !isNaN(userOffsetMilli) ? dateInMilli + userOffsetMilli : "";
    return dateInUtc;
};

module.exports = utility;