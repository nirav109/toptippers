'use strict';

var jwt = require('jsonwebtoken');

var Constant = require('../config/constant.js');
var mresponse = require('./mobile_response_handler.js');
module.exports = {
    CheckUrl: CheckUrl,
    ensureAuthorized: ensureAuthorized
}

/* Function is use check authorization of BASEURL.
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function CheckUrl(req, res, next) {
    console.log("baseUrl---------->", req.path)
    var is_free_auth = req.path.split('/f/').length > 1 ? ((req.headers["Authorization"] || req.headers["authorization"] || req.query["api_key"]) ? false : true) : false;
    if (!is_free_auth) {
        console.log("here")
        ensureAuthorized(req, res, next);
    } else {
        next();
    }
}

function ensureAuthorized(req, res, next) {
    // console.log("baseUrl--requires authorization------>", req.path,req.headers)
    var bearerToken;
    var bearerHeader = req.headers["Authorization"] || req.headers["authorization"] || req.query["api_key"];
    console.log("Token is : " + bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        console.log("hererr")
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        jwt.verify(bearerToken, "crm@$12&*01", function(err, decoded) {
            req.user = decoded;
            if (err) {
                console.log("Error is from here : " + JSON.stringify(err))
                return mresponse(res, Constant.AUTH_CODE, Constant.INVALID_TOKEN);
            }
            next();
        });
    } else {
        return mresponse(res, Constant.AUTH_CODE, Constant.TOKEN_ERROR);
    }
}