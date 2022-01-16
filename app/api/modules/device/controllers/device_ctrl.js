'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    DEVICE = mongoose.model('device'),
    response = require('../../../../lib/response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    updateToken: updateToken
};

function updateToken(req, res) {
    async function asy_add_category() {
        try {
                let userId = req.body.userId;
                
                    let condition_exist = {
                        user: req.body.userId,
                        isDeleted: false
                    }
                    let user_exist = await commonQuery.fetch_one(DEVICE, condition_exist)
                    if (user_exist) {
                        if (!mongoose.Types.ObjectId.isValid(userId)) {
                            return res.json({
                                code: Constant.ERROR_CODE,
                                message: Constant.NOT_PROPER_DATA
                            });
                        }
                        let obj_update = {
                            token: req.body.token,
                            platform: req.body.platform
                        }
                        let updateCondition = {
                            user: req.body.userId
                        };
                        let deviceData = await commonQuery.updateOneDocument(DEVICE, updateCondition, obj_update);
                        console.log("deviceData: "+JSON.stringify(deviceData));
                        if (deviceData) {
                            return res.json({
                                code: Constant.SUCCESS_CODE,
                                data: {},
                                message: Constant.DATA_UPDATE_SUCCESS,
                            });
    
                        } else {
                            return res.json({
                                code: Constant.ERROR_CODE,
                                message: Constant.DATA_UPDATE_UNSUCCESS
                            });
                        }
                    }else{
                        let devicedata = {
                            "token": req.body.token,
                            "platform": req.body.platform,
                            "user": req.body.userId
                        }
                        let device = await commonQuery.InsertIntoCollection(DEVICE, devicedata)
                        return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, device);
                    }

                
            

        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_category();
}