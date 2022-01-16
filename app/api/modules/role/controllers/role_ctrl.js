'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    ROLE = mongoose.model('role'),
    response = require('../../../../lib/response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addRole: addRole,
};


/* Function is use to add New Role
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addRole(req, res) {
    async function asy_add_role() {
        try {
            let condition_exist = {
                rolename: req.body.rolename
            }
            let role_exist = await commonQuery.fetch_one(ROLE, condition_exist)
            if (role_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.ROLE_EXIST);
            }
            else {
                let roledata = { "rolename": req.body.rolename }
                let role = await commonQuery.InsertIntoCollection(ROLE, roledata)
                return response(res, Constant.SUCCESS_CODE, Constant.NEW_ROLE_SAVE_SUCCESS, role);
            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };

    }
    asy_add_role().then(data => { });
}