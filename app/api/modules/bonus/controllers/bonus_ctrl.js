'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    BONUS = mongoose.model('bonus'),
    USER_BONUS = mongoose.model('userBonus'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addBonus: addBonus,
    getBonusList: getBonusList,
    deleteBonus: deleteBonus,
    addUserBonus: addUserBonus

};
/* Function is use to add New Bonus
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addBonus(req, res) {
    async function asy_add_bonus() {
        try {
            let condition_exist = {
                bonusname: req.body.bonusname
            }
            let bonus_exist = await commonQuery.fetch_one(BONUS, condition_exist)
            if (bonus_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.BONUS_EXIST);
            }
            else {
                let bonusdata = {
                    "bonusname": req.body.bonusname,
                    "description": req.body.description
                }
                let bonus = await commonQuery.InsertIntoCollection(BONUS, bonusdata)
                return response(res, Constant.SUCCESS_CODE, Constant.NEW_BONUS_SAVE_SUCCESS, bonus);
            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };

    }
    asy_add_bonus().then(data => { });
}

/* Function is use to fetch list of all bonuses
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getBonusList(req, res) {
    async function asy_init() {
        try {
            let count = req.body.count ? parseInt(req.body.count) : 5;
            let skip = 0;
            let page = req.body.page ? req.body.page : 0;
            if (count && page) {
                skip = count * (page);
                // skip = count * (page - 1);
            }
            let search_string = req.body.search_string;
            let condition = { isDeleted: false }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'bonusname': new RegExp(search_string, 'gi')
                }
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(BONUS, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            BONUS.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, bonusList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: bonusList,
                    totalCount: totalCount
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

/* Function is use to delete sport record
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function deleteBonus(req, res) {
    try {
        let bonusId = req.body.bonusId;
        if (!mongoose.Types.ObjectId.isValid(bonusId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(BONUS, {
            _id: bonusId
        }, {
            isDeleted: true
        }).then(function (response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_BONUS_SUCCESS,
            });
        }).catch(function (err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        })

    } catch (err) {
        return res.json({
            code: Constant.REQ_DATA_ERROR_CODE,
            message: Constant.SOMETHING_WENT_WRONG
        });
    }
}

/* Function is use to update sport details
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateBonus(req, res) {
    async function asy_initUpdate() {
        try {
            let bonusId = req.body.bonusId;
            if (!mongoose.Types.ObjectId.isValid(bonusId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                sportname: req.body.sportname,

            }
            let updateCondition = {
                _id: bonusId
            };
            let sportData = await commonQuery.updateOneDocument(SPORT, updateCondition, obj_update)
            if (sportData) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    data: {},
                    message: Constant.SPORT_UPDATED_SUCCESS,
                });

            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.SPORT_UPDATED_UNSUCCESS
                });
            }
        } catch (err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_initUpdate();
}

function addUserBonus(req, res) {
    async function asy_add_user_bonus() {
       
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let userId = req.body.userId;
            let roundId = req.body.roundId;
            let users = req.body.userBonus;

            for(let i=0; i<users.length; i++){

                let condition_exist = {
                    user: userId,
                    round: roundId,
                    comp: users[i].compId,
                    isDeleted: false
                }
                let bonus_exist = await commonQuery.fetch_one(USER_BONUS, condition_exist)
                if (bonus_exist) {
    
                    let obj_update = {
                        "currentBonus": users[i].currentBonus
                    }
                    let updateCondition = {
                        _id: bonus_exist.id
                    };
                    let bonusData = await commonQuery.updateOneDocument(USER_BONUS, updateCondition, obj_update);
             
                }else{
                    let bonusdata = {
                        "user": userId,
                        "round": roundId,
                        "comp": users[i].compId,
                        "currentBonus": users[i].currentBonus,
                    }
                
                    let bonusData = await commonQuery.InsertIntoCollection(USER_BONUS, bonusdata);
    
                }

            }

            return mresponse(res, Constant.SUCCESS_CODE, Constant.ADD_SUCCESS);

        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };
    }
    asy_add_user_bonus();
}
