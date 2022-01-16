'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    COMP = mongoose.model('comp'),
    JOINCOMP = mongoose.model('joincomp'),
    USER_BONUS = mongoose.model('userBonus'),
    USER = mongoose.model('user'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addCompetition: addCompetition,
    getCompetitionList: getCompetitionList,
    getCompListbyCreatorId: getCompListbyCreatorId,
    getCompetitionDetails: getCompetitionDetails,
    getCompListbySportId: getCompListbySportId,
    getCompListbySportandUserId: getCompListbySportandUserId,
    joinCompetition: joinCompetition,
    getMycompList: getMycompList,
    leaveCompetition: leaveCompetition,
    getJoinedCompetitions: getJoinedCompetitions,
    validateCompetition: validateCompetition,
    getFindCompetitions: getFindCompetitions,
    getJoinedBonusCompetitions: getJoinedBonusCompetitions,
    deleteCompetition: deleteCompetition

};


/* Function is use to add New comp
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addCompetition(req, res) {
    async function asy_add_Competition() {
        try {
            let kingBotUserId = "5edd68d52c189009fa897c92"
            let competitionId = req.body.competitionId;
            let condition_exist = {
                isDeleted: false
            }
            var compName = `^${req.query.competitionname}$`;

            condition_exist = {
                competitionname: new RegExp(compName, 'i')
            }
            let comp_exist = await commonQuery.fetch_one(COMP, condition_exist)
            if (comp_exist) {
                return mresponse(res, Constant.ALLREADY_EXIST, Constant.COMPETITION_EXIST);
            }
            if (!competitionId) {

                if (!mongoose.Types.ObjectId.isValid(req.body.creatorId) || !mongoose.Types.ObjectId.isValid(req.body.sportId)) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
                }

                let compdata = {
                    "competitionname": req.body.competitionname,
                    "isPublic": req.body.isPublic,
                    "password": req.body.password || '',
                    "sport": req.body.sportId,
                    "createdBy": req.body.creatorId,
                    "bonus2xpoint": req.body.bonus2xpoint,
                    "bonus3xpoint": req.body.bonus3xpoint,
                    "bonuspoint": req.body.bonuspoint,
                    "heaterBonus": req.body.heaterBonus,
                    "smugTipBonus": req.body.smugTipBonus,
                    "finalFrenzyBonus": req.body.finalFrenzyBonus,
                    "kingbot": req.body.kingbot,
                }
                let compData = await commonQuery.InsertIntoCollection(COMP, compdata)
                let joinCompdata = {
                    "competitionId": compData._id,
                    "userId": compData.createdBy
                }
                let joincom = await commonQuery.InsertIntoCollection(JOINCOMP, joinCompdata);
                let joinKingBotCompdata = {
                    "competitionId": compData._id,
                    "userId": kingBotUserId
                }
                let joinkingBot = await commonQuery.InsertIntoCollection(JOINCOMP, joinKingBotCompdata)
                return mresponse(res, Constant.SUCCESS_CODE, Constant.NEW_COMP_SAVE_SUCCESS, compData);
            } else {
                if (!mongoose.Types.ObjectId.isValid(competitionId)) {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
                let obj_update = {
                    "isPublic": req.body.isPublic,
                    // "password": req.body.password||'',
                }
                let updateCondition = {
                    _id: competitionId
                };
                let comppData = await commonQuery.updateOneDocument(COMP, updateCondition, obj_update)
                if (comppData) {
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.COMP_UPDATED_SUCCESS, compData);

                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.COMP_UPDATED_UNSUCCESS
                    });
                    return mresponse(res, Constant.ERROR_CODE, Constant.COMP_UPDATED_UNSUCCESS);
                }
            }

        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_Competition();
}

function validateCompetition(req, res) {
    async function asy_validate_Competition() {
        try {
            let condition_exist = {
                isDeleted: false
            }
            var compName = `^${req.query.competitionname}$`;

            condition_exist = {
                competitionname: new RegExp(compName, 'i')
            }
            let comp_exist = await commonQuery.fetch_one(COMP, condition_exist)
            if (comp_exist) {
                return mresponse(res, Constant.ALLREADY_EXIST, Constant.COMPETITION_EXIST);
            } else {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.COMPETITION_NOT_EXIST);
            }

        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };


    }
    asy_validate_Competition();
}

/* Function is use to fetch list of all comp
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getCompetitionList(req, res) {
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
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(COMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = COMP.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compList) {
                (async() => {


                    for (let i = 0; i < compList.length; i++) {
                        let joincomp_condition = {
                            competitionId: compList[i]._id
                        }
                        let totalCount = await commonQuery.countData(JOINCOMP, joincomp_condition);
                        compList[i].totalCount = totalCount;
                    }

                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: compList,
                        totalCount: totalCount
                    })

                })();

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

function getJoinedCompetitions(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let search_string = req.query.search;
            let condition = { isDeleted: false, userId: req.query.userId, isJoined: true }
            if (req.query.search) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(JOINCOMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }


            let query = JOINCOMP.find(condition)

            query.populate({
                    path: 'competitionId',
                    populate: [{
                        path: 'sport',
                        select: 'sportname'
                    }, {
                        path: 'createdBy',
                        select: 'username'
                    }]

                })
                .sort(sortObject).lean().exec(function(err, compList) {
                    if (err) {
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }

                    let comps = [];

                    if (compList.length > 0) {
                        (async() => {
                            for (let i = 0; i < compList.length; i++) {

                                compList[i].competitionId.isJoined = true;
                                // let condition_exist = {
                                //     userId: req.query.userId,
                                //     favCompetition: compList[i].competitionId._id
                                // }
                                // let isFavorite = await commonQuery.fetch_one(USER, condition_exist);
                                // if (isFavorite) {
                                //     compList[i].competitionId.isFavorite = true;
                                // }else{
                                //     compList[i].competitionId.isFavorite = false;
                                // }
                                comps.push(compList[i].competitionId);



                            }
                            if (comps.length > 1) {
                                comps = comps.sort((a, b) => a.competitionname.localeCompare(b.competitionname))
                            }
                            if (req.query.skip && req.query.limit) {
                                comps.slice(skip, skip + count);
                            }
                            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, comps, compList.length);
                        })();


                    } else {
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, comps, compList.length);

                    }

                })



        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}

function getJoinedBonusCompetitions(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.userId) || !mongoose.Types.ObjectId.isValid(req.query.roundId) || !mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let search_string = req.query.search;
            let condition = { isDeleted: false, userId: req.query.userId, isJoined: true }
            if (req.query.search) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(JOINCOMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }


            let query = JOINCOMP.find(condition)

            query.populate({
                    path: 'competitionId',
                    populate: [{
                        path: 'sport',
                        select: 'sportname'
                    }, {
                        path: 'createdBy',
                        select: 'username'
                    }]

                })
                .sort(sortObject).lean().exec(function(err, compList) {
                    if (err) {
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }

                    let comps = [];
                    if (compList.length > 0) {

                        (async() => {

                            for (let i = 0; i < compList.length; i++) {
                                if (compList[i].competitionId.sport._id.equals(req.query.sportId)) {

                                    let bonus_condition = {
                                        isDeleted: false,
                                        user: req.query.userId,
                                        comp: compList[i].competitionId._id,
                                    }
                                    let bonusList = await commonQuery.findData(USER_BONUS, bonus_condition);
                                    compList[i].competitionId.lastAppliedBonus = 0;
                                    if (bonusList.data.length > 0) {
                                        bonusList.data.map(bonus => {
                                            if (bonus.currentBonus == 2) {
                                                compList[i].competitionId.bonus2xpoint--;
                                            } else if (bonus.currentBonus == 3) {
                                                compList[i].competitionId.bonus3xpoint--;
                                            } else {
                                                compList[i].competitionId.bonuspoint--;
                                            }

                                            if (bonus.round.equals(req.query.roundId)) {
                                                compList[i].competitionId.lastAppliedBonus = bonus.currentBonus;
                                            }
                                        })
                                    }
                                    compList[i].competitionId.isJoined = true;
                                    // let condition_exist = {
                                    //     _id: req.query.userId,
                                    //     favCompetition: compList[i].competitionId._id
                                    // }
                                    // let isFavorite = await commonQuery.fetch_one(USER, condition_exist);
                                    // if (isFavorite) {
                                    //     compList[i].competitionId.isFavorite = true;
                                    // }else{
                                    //     compList[i].competitionId.isFavorite = false;
                                    // }
                                    comps.push(compList[i].competitionId);

                                }

                            }
                            if (comps.length > 1) {
                                comps = comps.sort((a, b) => a.competitionname.localeCompare(b.competitionname));
                            }
                            totalCount = comps.length;
                            if (comps.length > 0) {
                                if (req.query.skip && req.query.limit) {
                                    comps.slice(skip, skip + count);
                                }
                                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, comps, totalCount);
                            } else {
                                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, comps, totalCount);

                            }

                        })();



                    } else {
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, comps, totalCount);

                    }

                })



        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}

function getFindCompetitions(req, res) {
    async function asy_init() {
        try {
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let search_string = req.query.search;
            let condition = { isDeleted: false }
            if (req.query.search) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            let totalCount = await commonQuery.countData(COMP, condition);
            let sortValue = req.body.sortValue || 'competitionname';
            let sortOrder = req.body.sortOrder || '1';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let query = COMP.find(condition);

            query.populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'createdBy',
                select: 'username',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compList) {

                if (err) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }
                if (compList.length > 0) {
                    (async() => {
                        for (let i = 0; i < compList.length; i++) {
                            let condition_exist = {
                                userId: req.query.userId,
                                competitionId: compList[i]._id,
                                isJoined: true
                            }
                            let isJoined = await commonQuery.fetch_one(JOINCOMP, condition_exist);
                            if (isJoined) {
                                compList[i].isJoined = true;
                            } else {
                                compList[i].isJoined = false;
                            }
                        }
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, compList, totalCount);

                    })();
                } else {
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, compList, totalCount);

                }






            })

        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

/* Function is use to fetch getCompListbyCreatorId
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getCompListbyCreatorId(req, res) {
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
            let condition = { isDeleted: false, createdBy: req.body.creatorId }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(COMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = COMP.find(condition)
                // COMP.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'createdBy',
                select: 'name',
            }).populate({
                path: 'bonus.bonusId',
                select: 'bonusname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compListbyId) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: compListbyId,
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


/* Function is use to fetch comp detail based on comp Id
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getCompetitionDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.compId
            }
            COMP.findOne(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'createdBy',
                select: 'name',
            }).populate({
                path: 'bonus.bonusId',
                select: 'bonusname',
            }).exec(async function(err, compDetail) {
                console.log("compDetail", compDetail.id)
                let checkCond = {
                    competitionId: compDetail.id,
                    userId: req.body.userId,
                    isJoined: true
                }
                let compJoineddata = {}
                JOINCOMP.findOne(checkCond).exec(async function(err, data) {
                    if (data != null || undefined) {
                        console.log('enter')
                        compJoineddata.inCompetition = true
                    }
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCHED,
                        data: compDetail,
                        UserinCompetition: compJoineddata
                    })
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

/* Function is use to fetch getCompList based on sportId
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getCompListbySportId(req, res) {
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
            let condition = { isDeleted: false, sport: req.body.sportId }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(COMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = COMP.find(condition)
                // COMP.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'createdBy',
                select: 'name',
            }).populate({
                path: 'bonus.bonusId',
                select: 'bonusname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compListbyId) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: compListbyId,
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

/* Function is use to fetch getCompList based on sportId and userId
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getCompListbySportandUserId(req, res) {
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
            let condition = { isDeleted: false, sport: req.body.sportId, createdBy: req.body.creatorId }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(COMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = COMP.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'createdBy',
                select: 'name',
            }).populate({
                path: 'bonus.bonusId',
                select: 'bonusname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compListbyId) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: compListbyId,
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

/* Function is use to join Comp
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function joinCompetition(req, res) {
    async function asy_join_Competition() {

        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.competitionId) || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }


            let joinCompdata = {
                "competitionId": req.body.competitionId,
                "userId": req.body.userId,
                "isJoined": true,
                "seasonPoints": 0
            }
            let join_exist = {
                competitionId: req.body.competitionId,
                userId: req.body.userId
            }
            let join_comp_exist = await commonQuery.fetch_one(JOINCOMP, join_exist)
            if (join_comp_exist) {
                let joinComp_cond = {
                    competitionId: req.body.competitionId,
                    userId: req.body.userId
                }
                let obj_update = {
                    isJoined: true
                };
                let join_update = await commonQuery.updateOneDocument(JOINCOMP, joinComp_cond, obj_update)
                return mresponse(res, Constant.SUCCESS_CODE, Constant.COMP_JOIN_SUCCESS, join_update);
            } else {
                let joincom = await commonQuery.InsertIntoCollection(JOINCOMP, joinCompdata);
                return mresponse(res, Constant.SUCCESS_CODE, Constant.COMP_JOIN_SUCCESS, joincom);
            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };
    }
    asy_join_Competition();
}

/* Function is use to fetch getjoinedCompList based on userId
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getMycompList(req, res) {

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
            if (req.body.userId) {
                var condition = { isDeleted: false, isJoined: true, userId: req.body.userId }
            }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'competitionname': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(JOINCOMP, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            JOINCOMP.find(condition)
                .populate('competitionId').populate({
                    path: 'userId',
                    select: 'name',
                })
                .sort(sortObject).skip(skip).limit(count).lean().exec(function(err, compListbyId) {
                    if (req.body.sportId) {
                        let compListonSportId = compListbyId.filter(function(list) {
                            return list.competitionId.sport == req.body.sportId;
                        });
                        return res.json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.DATA_FETCH_SUCCESS,
                            data: compListonSportId,
                            totalCount: totalCount
                        })
                    } else {
                        return res.json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.DATA_FETCH_SUCCESS,
                            data: compListbyId,
                            totalCount: totalCount
                        })
                    }
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

/* Function is use to leave Comp
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function leaveCompetition(req, res) {
    async function asy_leave_Competition() {

        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.competitionId) || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let condition = {
                competitionId: req.body.competitionId,
                userId: req.body.userId,
            }
            console.log("cond", condition)
            let compData = await commonQuery.findoneData(JOINCOMP, condition)
            console.log("compDtata", compData)
            if (compData) {
                let leaveComp_cond = {
                    _id: compData.id
                }
                let obj_update = {
                    isJoined: false
                };
                let status_change = await commonQuery.updateOneDocument(JOINCOMP, leaveComp_cond, obj_update)
                return mresponse(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);
            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };
    }
    asy_leave_Competition();
}

function deleteCompetition(req, res) {
    try {
        let compId = req.body.compId;
        if (!mongoose.Types.ObjectId.isValid(compId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(COMP, {
            _id: compId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_GAME_SUCCESS,
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