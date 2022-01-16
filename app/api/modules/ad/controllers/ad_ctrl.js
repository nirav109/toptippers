'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    AD = mongoose.model('ad'),
    fs = require('fs'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js'),
    config = require("../../../../config/config").get(process.env.NODE_ENV),
    utility = require('../../../../lib/utility.js');


module.exports = {
    getAds: getAds,
    getAdList: getAdList,
    addUpdateAd: addUpdateAd,
    deleteAd: deleteAd
};

function getAds(req, res) {
    async function asy_init() {
        try {
            let type = req.query.type;
            let condition = {
                type: type,
                isDeleted: false
            }
            let totalCount = await commonQuery.countData(AD, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let query = AD.find(condition)
            query.sort(sortObject).lean().exec(function(err, adList) {
                if (err) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, adList, totalCount);

            })
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}


function getAdList(req, res) {
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
                    'name': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(AD, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            AD.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, adList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: adList,
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


function addUpdateAd(req, res) {
    async function asy_add_ad() {
        try {
            let adId = req.body.adId;
            if (!adId) {
                let condition_exist = {
                    name: req.body.name,
                    type: req.body.type,
                    isDeleted: false
                }
                let ad_exist = await commonQuery.fetch_one(AD, condition_exist)
                if (ad_exist) {
                    return response(res, Constant.ALLREADY_EXIST, Constant.DATA_EXIST);
                }

                if (req.files != null) {
                    let fileName = req.files.files.name;
                    let str = fileName.split(".");
                    if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "jpeg" || str[1].toLowerCase() == "gif" || str[1].toLowerCase() == "mp4") {
                        var updatedFileName = 'ad_' + utility.generateRandomString() + '.' + str.pop();
                        var filePath = Constant.AD_FILE_PATH + updatedFileName;
                        var updatedFilePath = config.baseUrl.concat(Constant.AD_FILE_PATH.replace("./", ""), updatedFileName);
                        fs.writeFile(filePath, (req.files.files.data), function(data, err) {
                            if (err) throw err;
                        })
                    }
                }
                let addata = {
                    "name": req.body.name,
                    "type": req.body.type,
                    "mediaType": req.body.mediaType,
                    "redirectUrl": req.body.redirectUrl,
                    "media": updatedFileName || ''
                }
                let ad = await commonQuery.InsertIntoCollection(AD, addata)
                return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, ad);
            } else {
                if (!e.Types.ObjectId.isValid(adId)) {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
                if (req.files != null) {
                    let fileName = req.files.files.name;
                    let str = fileName.split(".");
                    if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "jpeg" || str[1].toLowerCase() == "gif" || str[1].toLowerCase() == "mp4") {
                        var updatedFileName = 'ad_' + utility.generateRandomString() + '.' + str.pop();
                        var filePath = Constant.AD_FILE_PATH + updatedFileName;
                        var updatedFilePath = config.baseUrl.concat(Constant.AD_FILE_PATH.replace("./", ""), updatedFileName);
                        fs.writeFile(filePath, (req.files.files.data), function(data, err) {
                            if (err) throw err;
                        })
                    }
                }
                let obj_update = {
                    name: req.body.name,
                    type: req.body.type,
                    redirectUrl: req.body.redirectUrl,
                    mediaType: req.body.mediaType
                }
                if (updatedFileName) {
                    let condition = {
                        _id: adId,
                        isDeleted: false
                    }
                    let exist_ad = await commonQuery.fetch_one(AD, condition);

                    try {
                        if (exist_ad.media && fs.existsSync(Constant.AD_FILE_PATH + exist_ad.media)) {
                            fs.unlinkSync(Constant.AD_FILE_PATH + exist_ad.media);
                        }
                    } catch (err) {
                        return response(res, Constant.ERROR_CODE, err);
                    }

                    obj_update = {
                        name: req.body.name,
                        type: req.body.type,
                        mediaType: req.body.mediaType,
                        media: updatedFileName || ''
                    }
                }
                let updateCondition = {
                    _id: adId
                };
                let adData = await commonQuery.updateOneDocument(AD, updateCondition, obj_update)
                if (adData) {
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
    asy_add_ad();
}

function deleteAd(req, res) {
    try {
        let adId = req.body.adId;
        if (!e.Types.ObjectId.isValid(adId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(AD, {
            _id: adId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_DATA_SUCCESS,
            });
        }).catch(function(err) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        })

    } catch (err) {
        return res.json({
            code: Constant.ERROR_CODE,
            message: Constant.SOMETHING_WENT_WRONG
        });
    }
}