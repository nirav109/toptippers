'use strict';

var mongoose = require('mongoose'),
    fs = require('fs'),
    Constant = require('../../../../config/constant.js'),
    TEAM = mongoose.model('team'),
    response = require('../../../../lib/response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js'),
    utility = require('../../../../lib/utility.js');
module.exports = {
    addTeam: addTeam,
    getTeamList: getTeamList,
    deleteTeam: deleteTeam,
    updateTeam: updateTeam,
    getTeamDetails: getTeamDetails,
    blockTeam: blockTeam,
    updateTeamLogo: updateTeamLogo,
    getTeamListbySportId: getTeamListbySportId

};


/* Function is use to add Team data
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addTeam(req, res) {
    async function asy_add_team() {
        try {
            // console.log("team-----------")
            let condition_exist = {
                teamname: req.body.teamname,
                sport: req.body.sportId,
                isDeleted: false
            }
            let team_exist = await commonQuery.fetch_one(TEAM, condition_exist)
            if (team_exist) {
                return response(res, Constant.ALLREADY_EXIST, Constant.TEAM_EXIST);
            } else {
                // console.log("elsepart-----------------")
                if (req.files != null) {
                    // console.log("a")
                    let file_name = req.files.file.name;
                    let str = file_name.split(".");
                    // console.log("strlll", str)
                    if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "jpeg") {
                        var orignalLogoName = 'logo_' + utility.generateRandomString() + '.' + str[1];
                        // console.log("orignalLogoName", orignalLogoName)
                        let LogoPath = Constant.LOGO_IMG_PATH + orignalLogoName;
                        //upload image
                        fs.writeFile(LogoPath, (req.files.file.data), function(data, err) {
                            if (err) throw err;
                        })
                    }
                }
                let teamdata = {
                        teamname: req.body.teamname,
                        sport: req.body.sportId,
                        teamLogo: orignalLogoName || '',
                    }
                    // console.log("teamdata data", teamdata)
                let teamData = await commonQuery.InsertIntoCollection(TEAM, teamdata)
                    // console.log("teamb",teamData)
                return response(res, Constant.SUCCESS_CODE, Constant.NEW_TEAM_SAVE_SUCCESS, teamData);
            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };

    }
    asy_add_team().then(data => {});
}

/* Function is use to fetch list of added team
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getTeamList(req, res) {
    // console.log("getttttttttttt")
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
            let condition = { isDeleted: false };

            if (req.body.search_string) {
                //   let concat = {$concat: ["$firstName", " ", "$lastName"]}
                condition['$or'] = [{
                    'teamname': new RegExp(search_string, 'gi')
                }]
            }
            let totalCount = await commonQuery.countData(TEAM, condition);
            // console.log(req.body);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            TEAM.find(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, teamList) {
                // console.log("teamList",teamList)
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: teamList,
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

/* Function is use to delete team record
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function deleteTeam(req, res) {
    try {
        let teamId = req.body.teamId;
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(TEAM, {
            _id: teamId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_TEAM_SUCCESS,
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


/* Function is use to update team details
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateTeam(req, res) {
    // console.log("update",req.body)
    async function asy_initUpdate() {
        try {
            let teamId = req.body.teamId;
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                teamname: req.body.teamname,

            }
            let updateCondition = {
                _id: teamId
            };
            let teamData = await commonQuery.updateOneDocument(TEAM, updateCondition, obj_update)
            if (teamData) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    data: {},
                    message: Constant.TEAM_UPDATED_SUCCESS,
                });

            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.TEAM_UPDATED_UNSUCCESS
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

/* Function is use to fetch team detail based on Sport Id
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getTeamDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.teamId
            }
            TEAM.findOne(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).exec(async function(err, teamDetail) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCHED,
                    data: teamDetail
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


/* Function is use to block team
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function blockTeam(req, res) {
    async function team_status() {
        try {
            let teamId = req.body.teamId
            if (!mongoose.Types.ObjectId.isValid(teamId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let condition_exist = {
                _id: req.body.teamId
            }
            let teamData = await commonQuery.fetch_one(TEAM, condition_exist)
            if (teamData) {
                let obj_update = {
                    isActive: !teamData.isActive
                }
                let updateCondition = {
                    _id: teamData._id
                };
                let status_change = await commonQuery.updateOneDocument(TEAM, updateCondition, obj_update)
                return response(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);
            }

            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        };

    }
    team_status();
}

/* Function is use to update teamLogo
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateTeamLogo(req, res) {
    async function update_pic() {
        try {
            // console.log("req.files.file.name",req.files.file.name,req.body)
            let file_name = req.files.file.name;
            let str = file_name.split(".");
            if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "jpeg" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "webp") {
                var orignalLogoName = 'logo_' + utility.generateRandomString() + '.' + str[1];
                let LogoPath = Constant.LOGO_IMG_PATH + orignalLogoName;
                //upload image
                fs.writeFile(LogoPath, (req.files.file.data), function(data, err) {
                        if (err) throw err;
                    })
                    //save image in db
                    // let condition = {
                    //     teamId: req.body.teamId
                    // }
                    // let teamdata = await commonQuery.findoneData(TEAM, condition);
                    // if (teamdata) {
                let logo_path = {
                    teamLogo: orignalLogoName,
                }
                let updateCondition = {
                    _id: req.body.teamId
                };
                let userTeamData = await commonQuery.updateOneDocument(TEAM, updateCondition, logo_path)
                if (userTeamData) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.UPLOAD_SAVED,
                        data: userTeamData
                    });
                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.UPLOAD_FAILED,
                        data: ''
                    });
                }
                // }
            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }

        } catch (err) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    update_pic()
}

/* Function is use to fetch list of added team based on sport's Id
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getTeamListbySportId(req, res) {
    // console.log("getttttttttttt")
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
                //   let concat = {$concat: ["$firstName", " ", "$lastName"]}
                condition['$or'] = [{
                    'teamname': new RegExp(search_string, 'gi')
                }]
            }
            let totalCount = await commonQuery.countData(TEAM, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            TEAM.find(condition).populate({
                path: 'sport',
                select: 'sportname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, teamList) {
                // console.log("teamList",teamList)
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: teamList,
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