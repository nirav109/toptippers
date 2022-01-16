'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    SETTING = mongoose.model('setting'),
    GAME = mongoose.model('game'),
    TIPPING = mongoose.model('tipping'),
    COMP = mongoose.model('comp'),
    JOINCOMP = mongoose.model('joincomp'),
    USERBONUS = mongoose.model('userBonus'),
    ROUND = mongoose.model('round'),
    USER = mongoose.model('user'),
    response = require('../../../../lib/response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addupdateSetting: addupdateSetting,
    getSetting: getSetting,
    clearCurrentSession: clearCurrentSession

};


function addupdateSetting(req, res) {
    async function asy_add_setting() {
        try {
            let settingId = req.body.settingId;
            if (!settingId) {
                let condition_exist = {
                    currentDate: req.body.currentDate,
                    isTesting: req.body.isTesting
                }
                let content_exist = await commonQuery.fetch_one(SETTING, condition_exist)
                if (content_exist) {
                    return response(res, Constant.ALLREADY_EXIST, Constant.DATA_EXIST);
                }
                let contentdata = {
                    currentDate: req.body.currentDate,
                    isTesting: req.body.isTesting
                }
                let content = await commonQuery.InsertIntoCollection(SETTING, contentdata)
                return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, content);
            } else {
                if (!mongoose.Types.ObjectId.isValid(settingId)) {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
                let obj_update = {
                    currentDate: req.body.currentDate,
                    isTesting: req.body.isTesting
                }
                let updateCondition = {
                    _id: settingId
                };
                let settingData = await commonQuery.updateOneDocument(SETTING, updateCondition, obj_update)
                if (settingData) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        data: settingData,
                        message: Constant.DATA_UPDATE_SUCCESS,
                    });

                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.DATA_UPDATE_UNSUCCESS
                    });
                }
            }


        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_setting();
}


function getSetting(req, res) {
    async function asy_init() {
        try {
            let condition = {
                type: req.body.type
            }

            SETTING.find(condition).lean().exec(function(err, settingList) {


                console.log("settingList list isssssss---------->", settingList);
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: settingList[0]
                })
            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}


function clearCurrentSession(req, res) {
    async function asy_init() {
        try {
            let comp = await commonQuery.hard_delete(COMP);
            let joinComp = await commonQuery.hard_delete(JOINCOMP);
            let game = await commonQuery.hard_delete(GAME);
            let round = await commonQuery.hard_delete(ROUND);
            let tipping = await commonQuery.hard_delete(TIPPING);
            let userBonus = await commonQuery.hard_delete(USERBONUS);
            console.log("comp", comp);
            console.log("joinComp", joinComp);
            console.log("game", game);
            console.log("round", round);
            console.log("tipping", tipping);
            console.log("userBouns", userBonus);

            let obj_update_setting = {
                currentDate: new Date(),
                isTesting: false
            }
            let updateConditionSetting = {
                _id: "5f6f076b83290f167ecd6631"
            };
            let settingData = await commonQuery.updateOneDocument(SETTING, updateConditionSetting, obj_update_setting);
            console.log("settingData", settingData);

            let obj_update = {
                favCompetition: null
            }
            let updateCondition = {
                isDeleted: false
            };

            let userData = await commonQuery.updateAllDocument(USER, updateCondition, obj_update);
            console.log("api response", res);
            console.log("userData", userData);
            return res.json({
                code: Constant.SUCCESS_CODE,
                message: Constant.DELETE_DATA_SUCCESS,
                data: settingData
            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_init();
}