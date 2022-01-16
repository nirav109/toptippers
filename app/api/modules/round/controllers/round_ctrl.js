'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    ROUND = mongoose.model('round'),
    GAME = mongoose.model('game'),
    SETTING = mongoose.model('setting'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addRound: addRound,
    getRoundDetails: getRoundDetails,
    getRoundList: getRoundList,
    deleteRound: deleteRound,
    blockRound: blockRound,
    updateRound: updateRound,
    getRounds: getRounds,
    getCurrentRound: getCurrentRound
};


/* Function is use to add New Round
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addRound(req, res) {
    async function asy_add_round() {
        try {

            let isDateBetween = function isDateBetween(startDate, endDate, newRoundStartDate) {
                var from = new Date(startDate); // -1 because months are from 0 to 11
                from.setHours(0, 0, 0, 0);
                var to = new Date(endDate);
                to.setHours(23, 55, 0, 0);
                var check = new Date(newRoundStartDate);

                if (check > to) {
                    return 0;
                } else if (check < from) {
                    return 2
                } else {
                    return 1;
                }

            }
            let condition_exist = {
                roundno: req.body.roundno,
                sport: req.body.sportId,
                season: req.body.seasonId,
                isDeleted: false
            }
            let round_exist = await commonQuery.fetch_one(ROUND, condition_exist)
            if (round_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.ROUND_EXIST);
            } else {
                let previous_round = {
                    roundno: parseInt(req.body.roundno) - 1,
                    sport: req.body.sportId,
                    // season: req.body.seasonId,
                    isDeleted: false
                }
                let prev_round = await commonQuery.fetch_one(ROUND, previous_round)
                if (prev_round) {
                    if (isDateBetween(prev_round.startDate, prev_round.endDate, req.body.startDate) == 0) {
                        let rounddata = {
                            "roundno": req.body.roundno,
                            "roundname": req.body.roundname,
                            "roundtype": req.body.roundtype,
                            "sport": req.body.sportId,
                            // "season": req.body.seasonId,
                            "startDate": req.body.startDate,
                            "endDate": req.body.endDate,
                            "description": req.body.description,

                        }
                        let round = await commonQuery.InsertIntoCollection(ROUND, rounddata)
                        return response(res, Constant.SUCCESS_CODE, Constant.NEW_ROUND_SAVE_SUCCESS, round);
                    } else {
                        return response(res, Constant.ALLREADY_EXIST, "Round start date should be greater than previous round");

                    }
                } else {
                    let rounddata = {
                        "roundno": req.body.roundno,
                        "roundname": req.body.roundname,
                        "roundtype": req.body.roundtype,
                        "sport": req.body.sportId,
                        // "season": req.body.seasonId,
                        "startDate": req.body.startDate,
                        "endDate": req.body.endDate,
                        "description": req.body.description
                    }
                    let round = await commonQuery.InsertIntoCollection(ROUND, rounddata)
                    return response(res, Constant.SUCCESS_CODE, Constant.NEW_ROUND_SAVE_SUCCESS, round);
                }

            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };
    }
    asy_add_round().then(data => {});

}
/* Function is use to get Round list
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getRoundList(req, res) {
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
            let condition2 = {
                isDeleted: false,
                sport: req.body.sportId || '',
            }
            if (req.body.search_string) {
                condition['$or'] = [{
                        'roundname': new RegExp(search_string, 'gi')
                    }

                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(ROUND, condition2.sport == "" ? condition : condition2);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = ROUND.find(condition2.sport == "" ? condition : condition2)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, roundList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: roundList,
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

/* Function is use to get Round list
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getRounds(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let isDateBetween = function isDateBetween(startDate, endDate) {
                var from = new Date(startDate); // -1 because months are from 0 to 11
                from.setHours(0, 0, 0, 0);
                var to = new Date(endDate);
                to.setHours(23, 55, 0, 0);
                var check = new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" });
                check = new Date(check);

                if (check > to) {
                    return 0;
                } else if (check < from) {
                    return 2
                } else {
                    return 1;
                }

            }

            let condition = {
                isDeleted: false,
                sport: req.query.sportId
            }
            let totalCount = await commonQuery.countData(ROUND, condition);

            let query = ROUND.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).lean().exec(function(err, roundList) {
                if (err) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }

                if (totalCount > 0) {
                    roundList.map(round => {
                        if (isDateBetween(round.startDate, round.endDate) == 0) {
                            round.roundState = "past";
                        } else if (isDateBetween(round.startDate, round.endDate) == 1) {
                            round.roundState = "present";
                        } else {
                            round.roundState = "future";
                        }
                    })
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, roundList, totalCount);

                } else {
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, roundList, totalCount);

                }
            })



        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}




function getCurrentRound(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let sportId = req.query.sportId;
            let userId = req.query.userId;

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate) {
                var from = new Date(startDate); // -1 because months are from 0 to 11
                from.setHours(0, 0, 0, 0);
                var to = new Date(endDate);
                to.setHours(23, 55, 0, 0);
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);

                if (check > to) {
                    return 0;
                } else if (check < from) {
                    return 2
                } else {
                    return 1;
                }

            }

            let condition = {
                isDeleted: false,
                sport: req.query.sportId
            }
            let totalCount = await commonQuery.countData(ROUND, condition);
            let settingData = await commonQuery.fetch_one(SETTING, { type: "testing" });
            let currentDate = new Date();
            // if(settingData.isTesting){
            //     currentDate = settingData.currentDate;
            // }else{
            //     currentDate = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
            // }


            let query = ROUND.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).lean().exec(function(err, roundList) {
                if (err) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }

                if (totalCount > 0) {
                    let isCurrentRoundExist = false;
                    roundList.map(round => {
                        if (isDateBetween(round.startDate, round.endDate, currentDate) == 1) {
                            //round.roundState = "present";
                            isCurrentRoundExist = true;
                            (async() => {

                                let condition_exist = {
                                    round: round._id,
                                    isDeleted: false
                                }
                                let isRoundStarted = false;
                                let games = await commonQuery.findData(GAME, condition_exist);
                                if (games.data.length > 0) {
                                    games.data.map(game => {

                                        if (game.gameState !== "open") {
                                            isRoundStarted = true;
                                        }
                                    })
                                    round.isRoundStarted = isRoundStarted;
                                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, round);
                                } else {
                                    round.isRoundStarted = isRoundStarted;
                                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, round);

                                }


                            })();

                        }
                    })

                    if (!isCurrentRoundExist) {
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, {});
                    }

                } else {
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, {});

                }
            })




        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}

/* Function is use to getRoundDetails
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */


function getRoundDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.roundId
            }
            ROUND.findOne(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).exec(async function(err, roundDetail) {
                // compDetail.bonus
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCHED,
                    data: roundDetail
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


/* Function is use to delete round record
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function deleteRound(req, res) {
    try {
        let roundId = req.body.roundId;
        if (!mongoose.Types.ObjectId.isValid(roundId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(ROUND, {
            _id: roundId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_ROUND_SUCCESS,
            });
        }).catch(function(err) {
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

/* Function is use to block round
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function blockRound(req, res) {
    async function round_status() {
        try {
            let roundId = req.body.roundId
            if (!mongoose.Types.ObjectId.isValid(roundId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let condition_exist = {
                _id: req.body.roundId
            }
            let roundData = await commonQuery.fetch_one(ROUND, condition_exist)
            if (roundData) {
                let obj_update = {
                    isActive: !roundData.isActive
                }
                let updateCondition = {
                    _id: roundData._id
                };
                let status_change = await commonQuery.updateOneDocument(ROUND, updateCondition, obj_update)
                return response(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);
            }

            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        };

    }
    round_status();
}

/* Function is use to edit game detail
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateRound(req, res) {
    async function asy_initUpdate() {
        try {
            let roundId = req.body.roundId;
            if (!mongoose.Types.ObjectId.isValid(roundId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }

            let condition_exist = {
                roundno: req.body.roundno,
                sport: req.body.sportId,
                isDeleted: false,
                _id: { $ne: req.body.roundId }
            }
            let round_exist = await commonQuery.fetch_one(ROUND, condition_exist)
            if (round_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.ROUND_EXIST);
            } else {

                let obj_update = {
                    // roundno: req.body.roundno,
                    roundname: req.body.roundname,
                    // roundtype: req.body.roundtype,
                    // sport: req.body.sportId,
                    // description: req.body.description
                }
                let updateCondition = {
                    _id: roundId
                };
                let roundData = await commonQuery.updateOneDocument(ROUND, updateCondition, obj_update)
                if (roundData) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        data: {},
                        message: Constant.ROUND_UPDATED_SUCCESS,
                    });

                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.GAME_UPDATED_UNSUCCESS
                    });
                }

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