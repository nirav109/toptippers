'use strict';

const { forEach } = require('async');

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    SPORT = mongoose.model('sport'),
    USER = mongoose.model('user'),
    SEASON = mongoose.model('seasons'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addSport: addSport,
    addupdateSport: addupdateSport,
    deleteSport: deleteSport,
    getSportList: getSportList,
    updateSport: updateSport,
    getSportDetails: getSportDetails,
    getSports: getSports,
    getSportSeason: getSportSeason

};


/* Function is use to add New Sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addSport(req, res) {
    async function asy_add_sport() {
        try {
            let condition_exist = {
                sportname: req.body.sportname,
                seasonId: req.body.seasonId
            }
            let sport_exist = await commonQuery.fetch_one(SPORT, condition_exist)
            if (sport_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.SPORT_EXIST);
            } else {
                let sportdata = { "sportname": req.body.sportname, }
                let sport = await commonQuery.InsertIntoCollection(SPORT, sportdata)
                return response(res, Constant.SUCCESS_CODE, Constant.NEW_SPORT_SAVE_SUCCESS, sport);
            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };

    }
    asy_add_sport().then(data => {});
}

/* Function is use to add/edit Sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function addupdateSport(req, res) {
    async function asy_add_category() {
        try {
            let sportId = req.body.sportId;
            if (!sportId) {
                let condition_exist = {
                    sportname: req.body.sportname,
                    isDeleted: false
                }
                let sport_exist = await commonQuery.fetch_one(SPORT, condition_exist)
                if (sport_exist) {
                    return response(res, Constant.ALLREADY_EXIST, Constant.SPORT_EXIST);
                }
                let sportdata = {
                    "sportname": req.body.sportname,
                    "description": req.body.description || '',
                    "type": req.body.type
                }
                let sport = await commonQuery.InsertIntoCollection(SPORT, sportdata)
                return response(res, Constant.SUCCESS_CODE, Constant.NEW_SPORT_SAVE_SUCCESS, sport);
            } else {
                if (!mongoose.Types.ObjectId.isValid(sportId)) {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
                let obj_update = {
                    sportname: req.body.sportname,
                    description: req.body.description,
                    type: req.body.type
                }
                let updateCondition = {
                    _id: sportId
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
            }


        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_category();
}


/* Function is use to fetch list of all sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getSportList(req, res) {
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
            let condition = {
                isDeleted: false
            }
            let condition2 = {
                seasonId: req.body.seasonId || '',
            }

            if (req.body.search_string) {
                condition['$or'] = [{
                    'sportname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(SPORT, condition2.seasonId == "" ? condition : condition2);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let currentSeason = await SEASON.find({ $and: [{ startDate: { $lte: new Date() } }, { endDate: { $gte: new Date() } }] })
            console.log("current Season isssss", currentSeason);
            // let currentSeason = db.sponsoreds.find({ $and: [{ startDate: { $lte: new Date() } }, { endDate: { $gte: new Date() } }] })
            // console.log("current seasons issss", currentSeason);

            SPORT.find(condition2.seasonId == "" ? condition : condition2).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, sportList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: sportList,
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

/* Function is use to fetch list of all sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getSports(req, res) {
    async function asy_init() {
        try {
            let favSportId = '';
            let favSportName = '';
            let condition = { isDeleted: false }
                // let totalCount = await commonQuery.countData(SPORT, condition2);
            let arrUnselectedSport = []

            let con_sport_exist = {
                _id: req.query.userId,
                // sport: sportList[i]._id, // userID
                //sport: sportList[i]._id, //sport
            }
            let isSelected = await commonQuery.fetch_one(USER, con_sport_exist)

            let findSeason = {
                isActive: true
            }
            console.log("find Season isss", findSeason);
            let currentSeason = await SEASON.find(findSeason)

            console.log("currentSeason issssss", currentSeason);
            let condition2 = {
                _id: currentSeason[0].sport.map((x, index) => x),
                isDeleted: false

            }
            let totalCount = await commonQuery.countData(SPORT, condition2);
            // console.log("count issss", totalCount);
            let seasonSport = await SPORT.find(condition2)
            console.log("seasonSport issssss", seasonSport);




            SPORT.find(condition2).lean().exec(function(err, sportList) {
                if (sportList.length > 0) {
                    (async() => {
                        for (let i = 0; i < sportList.length; i++) {
                            if (req.query.userId) {
                                let condition_exist = {
                                    _id: req.query.userId,
                                    favSport: sportList[i]._id,
                                }
                                let isFavorite = await commonQuery.fetch_one(USER, condition_exist);
                                if (isFavorite) {
                                    sportList[i].isFavorite = true;
                                    console.log("Length is : " + favSportId.length)
                                    favSportId = sportList[i]._id;
                                    favSportName = sportList[i].sportname;
                                } else {
                                    sportList[i].isFavorite = false;
                                    //favSportId = '';
                                }
                                if (isSelected.sport !== null) {
                                    if (isSelected.sport.includes(sportList[i]._id)) {
                                        sportList[i].isSelect = true;
                                    } else {
                                        sportList[i].isSelect = false;
                                        arrUnselectedSport.push(i)
                                    }
                                } else {
                                    sportList[i].isSelect = false;
                                }
                            }
                        }
                        if (req.query.isSelectedList == 0) {
                            let arrReverse = arrUnselectedSport.reverse()
                            console.log("arrUnselectedSport : " + JSON.stringify(arrReverse))
                                //console.log("arrUnselectedSport.length : " + JSON.stringify(arrUnselectedSport.length))
                            for (let j = 0; j < arrReverse.length; j++) {
                                console.log("Print index is : " + arrReverse[j])
                                sportList.splice(arrReverse[j], 1);
                            }
                            totalCount = sportList.length
                        }
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, sportList, totalCount, '', '', favSportId, favSportName);
                    })();
                } else {
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, sportList, totalCount, '', '', favSportId, favSportName);
                }

            })
        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
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
function deleteSport(req, res) {
    try {
        let sportId = req.body.sportId;
        if (!mongoose.Types.ObjectId.isValid(sportId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(SPORT, {
            _id: sportId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_SPORT_SUCCESS,
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

/* Function is use to update sport details
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateSport(req, res) {
    async function asy_initUpdate() {
        try {
            let sportId = req.body.sportId;
            if (!mongoose.Types.ObjectId.isValid(sportId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                sportname: req.body.sportname,

            }
            let updateCondition = {
                _id: sportId
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

/* Function is use to fetch sport detail based on Sport Id
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getSportDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.sportId
            }
            let sportDetail = SPORT.findOne(condition).exec(async function(err, sportDetail) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCHED,
                    data: sportDetail
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

function getSportSeason(req, res) {
    async function asy_init() {
        try {
            let condition = {
                seasonId: req.body.seasonId,
                isDeleted: false
            }
            let totalCountSport = await commonQuery.countData(SPORT, condition);

            let query = SPORT.find(condition)
            query.populate({
                path: 'seasonId',
                select: 'seasonname'
            }).lean().exec(function(err, results) {
                if (err) {
                    return response(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }
                if (totalCountSport > 0) {
                    console.log("totalCountSport", totalCountSport);
                    console.log("totalCountSport Dataaaa", results);
                    return response(res, Constant.SUCCESS_CODE, results);

                }
            })
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_init();
}