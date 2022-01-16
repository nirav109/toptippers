"use strict";

var mongoose = require("mongoose"),
    commonQuery = require("../../../../lib/commonQuery.js"),
    Constant = require("../../../../config/constant.js"),
    SEASONS = mongoose.model("seasons"),
    SPORTS = require("../../sport/model/sportSchema"),
    response = require("../../../../lib/response_handler.js"),
    commonQuery = require("../../../../lib/commonQuery.js"),
    utility = require("../../../../lib/utility.js");

module.exports = {
    addNewSeason: addNewSeason,
    getSeasonList: getSeasonList,
    deleteSeason: deleteSeason,
    blockSeason: blockSeason,
    getSeasonDetails: getSeasonDetails
};

/* Function is use to add NewSeason data
 * @access private
 * @return json
 * Created by maxthonpc7
 * Created Date
 */

function addNewSeason(req, res) {
    async function asy_add_season() {
        try {
            // console.log(new Date().getTime())
            let currentDate = new Date()
                // currentDate.setHours(0, 0, 0, 0)
            let StartDate = new Date(req.body.startDate)
            let EndDate = new Date(req.body.endDate)

            console.log(req.body);




            //if (startDate.)




            let isDateBetween = function isDateBetween(
                startDate,
                endDate,
                newSeasonStartDate
            ) {
                var from = new Date(startDate); // -1 because months are from 0 to 11
                from.setHours(0, 0, 0, 0);
                var to = new Date(endDate);
                to.setHours(23, 55, 0, 0);
                var check = new Date(newSeasonStartDate);
                console.log("checkingggg check", check);
                console.log("checkingggg from", from);
                if (check > to) {
                    return 0;
                } else if (check <= from) {
                    return 2;
                } else {
                    return 1;
                }
            };



            let prev_season = await SEASONS.find().sort({ '_id': -1 }).limit(1);
            // console.log('Prevous data')
            //   console.log(prev_season);



            if (prev_season.length == 0) {

                console.log(" start date", StartDate);
                console.log(" current date", currentDate);
                if (currentDate.getTime() <= StartDate.getTime()) {
                    let seasondata = {
                        "seasonname": req.body.seasonname,
                        "startDate": req.body.startDate,
                        "endDate": req.body.endDate,
                        "isActive": currentDate.getTime() > StartDate.getTime() && EndDate.getTime() > currentDate.getTime() ? true : false,
                        "sport": req.body.sport
                    }
                    if (StartDate.getTime() < EndDate.getTime()) {

                        let season = await commonQuery.InsertIntoCollection(SEASONS, seasondata)
                        return response(res, Constant.SUCCESS_CODE, Constant.NEW_SEASON_SAVE_SUCCESSFuLLY, season);
                    } else {
                        return response(res, Constant.ENTER_VALID_START_DATE);
                    }

                } else {
                    return response(res, Constant.PLEASE_ENTER_VALID_DATE);
                }


            } else {

                let prev_season_enddate = new Date(prev_season[0].endDate)




                if (prev_season[0].isActive == true && currentDate.getTime() < prev_season_enddate.getTime()) {
                    console.log("inside IFFFF");
                    return response(res, Constant.ERROR_CODE, Constant.SEASON_ALREADY_STARTDED)

                } else {
                    // console.log("inside IFFFF ELSEEE");

                    if (isDateBetween(prev_season[0].startDate, prev_season[0].endDate, req.body.startDate) == 0) {
                        // let currentDate = new Date()
                        // sconsole.log("currentDate issss", currentDate);


                        if (prev_season.length >= 0) {

                            if (currentDate.getTime() < StartDate.getTime()) {



                                let seasondata = {
                                    "seasonname": req.body.seasonname,
                                    "startDate": req.body.startDate,
                                    "endDate": req.body.endDate,
                                    "sport": req.body.sport,
                                    "isActive": currentDate.getTime() > StartDate.getTime() && EndDate.getTime() > currentDate.getTime() ? true : false,
                                    "sport": req.body.sport
                                }

                                if (StartDate.getTime() < EndDate.getTime()) {

                                    // let season = await commonQuery.InsertIntoCollection(SEASONS, seasondata)
                                    return response(res, Constant.SUCCESS_CODE, Constant.NEW_SEASON_SAVE_SUCCESSFuLLY, season);
                                } else {
                                    return response(res, Constant.ERROR_CODE, Constant.ENTER_VALID_START_DATE);
                                }

                            } else {
                                return response(res, Constant.ERROR_CODE, Constant.PLEASE_ENTER_VALID_DATE);
                            }

                        } else {


                            if (currentDate.getTime() < StartDate.getTime()) {

                                let seasondata = {
                                    "seasonname": req.body.seasonname,
                                    "startDate": req.body.startDate,
                                    "endDate": req.body.endDate,
                                    "isActive": currentDate.getTime() > StartDate.getTime() && EndDate.getTime() > currentDate.getTime() ? true : false,
                                    "sport": req.body.sport
                                }

                                if (StartDate.getTime() < EndDate.getTime()) {

                                    // let season = await commonQuery.InsertIntoCollection(SEASONS, seasondata)
                                    return response(res, Constant.SUCCESS_CODE, Constant.NEW_SEASON_SAVE_SUCCESSFuLLY, season);
                                } else {
                                    return response(res, Constant.ERROR_CODE, Constant.ENTER_VALID_START_DATE);
                                }
                            } else {
                                return response(res, Constant.ERROR_CODE, Constant.PLEASE_ENTER_VALID_DATE);
                            }
                        }

                    } else {
                        return response(res, Constant.ALLREADY_EXIST, "Season start date should be greater than previous season");

                    }
                }
            }

        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        }
    }
    asy_add_season().then((data) => {});
}


/* Function is use to get Season list
 * @return json
 * Created by maxthonpc7
 */


function getSeasonList(req, res) {
    async function asy_init() {
        try {
            // var today = new Date().toLocaleDateString()
            // console.log("today date issss", today);
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
                        'seasonname': new RegExp(search_string, 'gi')
                    }

                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(SEASONS, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = SEASONS.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, seasonList) {

                // console.log(seasonList.map((x, index) => x.startDate));

                if (seasonList) {
                    seasonList.map((x, index) => {
                            let start = new Date(x.startDate)
                            let end = new Date(x.endDate)
                            x.startDate = start.toISOString().split('T')[0];
                            x.endDate = end.toISOString().split('T')[0];

                        })
                        // console.log(seasonList);
                }
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: seasonList,
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


/* Function is use to get Season list
 * @return json
 * Created by maxthonpc7
 */


function deleteSeason(req, res) {
    try {
        let seasonId = req.body.seasonId
        if (!mongoose.Types.ObjectId.isValid(seasonId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(SEASONS, {
            _id: seasonId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_SEASON_SUCCESS
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


/* Function is use to get Season list
 * @return json
 * Created by maxthonpc7
 */


function blockSeason(req, res) {
    async function season_status() {
        try {
            let seasonId = req.body.seasonId
            if (!mongoose.Types.ObjectId.isValid(seasonId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let condition_exist = {
                _id: req.body.seasonId
            }
            let seasonData = await commonQuery.fetch_one(SEASONS, condition_exist)
                // console.log(seasonData);
          s      // console.log("seasonData", seasonData.isActive);

            if (seasonData) {
                let endDate = new Date(seasonData.endDate)
                let currentDate = new Date()
                    // console.log("end Date isss" + endDate + "curren  Date isss" + currentDate);

                if (endDate.getTime() < currentDate.getTime()) {
                    // console.log("inside iffffff");
                    return response(res, Constant.ERROR_CODE, "Season Already Ended")
                } else {
                    console.log(" inside ifff elseeeeeeee");

                    let CheckSeason = await SEASONS.find({ isActive: true })
                        //   console.log("Check Season active or not", CheckSeason);

                    // console.log(CheckSeason.length > 0);

                    if (CheckSeason.length > 0) {
                        if (CheckSeason[0]._id == req.body.seasonId) {

                            let currentDate = new Date()
                            let endDate = new Date(CheckSeason[0].endDate)

                            if (currentDate.getTime() > endDate.getTime()) {

                                let obj_update = {
                                    isActive: !seasonData.isActive
                                }
                                let updateCondition = {
                                    _id: seasonData._id
                                };
                                let status_change = await commonQuery.updateOneDocument(SEASONS, updateCondition, obj_update)
                                return response(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);

                            } else {

                                return response(res, Constant.ERROR_CODE, "After the session is over, you can deactivate the session");
                            }

                            // let status_change = await commonQuery.updateOneDocument(SEASONS, updateCondition, obj_update)
                        } else {

                            return response(res, Constant.ERROR_CODE, "one of season already starting ")
                        }
                    } else {

                        let currentDtae = new Date()

                        let startDate = new Date(seasonData.startDate)

                        console.log("currentDtae" + currentDtae + "startDate" + startDate);
                        if (currentDtae.getTime() < startDate.getTime()) {

                            let obj_update = {
                                isActive: !seasonData.isActive
                            }
                            let updateCondition = {
                                _id: seasonData._id
                            };
                            let status_change = await commonQuery.updateOneDocument(SEASONS, updateCondition, obj_update)
                            return response(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);
                        } else {
                            return response(res, Constant.ERROR_CODE, "not Proper Data")
                        }


                    }
                }
            }

            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        };

    }
    season_status();
}


/* Function is use to get Season list
 * @return json
 * Created by maxthonpc7
 */


function getSeasonDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.seasonId
            }
            console.log();
            SEASONS.findOne(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).exec(async function(err, seasonDetail) {
                console.log(seasonDetail);
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCHED,
                    data: seasonDetail
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