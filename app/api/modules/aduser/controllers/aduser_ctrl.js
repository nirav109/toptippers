'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    ADUSER = mongoose.model('aduser'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    updateAdClick: updateAdClick,
    getAdClicks: getAdClicks
};

function updateAdClick(req, res) {
    async function asy_update_ad_click() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let aduserData = {
                user: req.body.userId,
                ad: req.body.adId ? req.body.adId : "60231d680c67946878ba8cca"
                //ad: "60231d680c67946878ba8cca",

            }
            let aduser = await commonQuery.InsertIntoCollection(ADUSER, aduserData)
            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, aduser);
            
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, err);
        };
    }
    asy_update_ad_click();
}

function getAdClicks(req, res) {
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
            // if (req.body.search_string) {
            //     condition['$or'] = [{
            //         'user.name': new RegExp(search_string, 'gi')
            //     },
            //     {
            //         'user.email': new RegExp(search_string, 'gi')
            //     },
            //     ]
            // }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(ADUSER, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = ADUSER.find(condition)
            query.populate({
                path: 'ad',
                select: 'name type image url'
            }).populate({
                path: 'user',
                select: 'name email'
            }).sort(sortObject).lean().exec(function (err, aduserList) {
                let filtered = aduserList;
                if(req.body.search_string){
                    filtered = aduserList.filter(data => data.user.name.toLowerCase().includes(req.body.search_string.toLowerCase()) || data.user.email.toLowerCase().includes(req.body.search_string.toLowerCase()));
                }


                if(filtered.length>0 && !req.body.isAllData){
                    let skippedData = filtered.slice(skip,skip+count);
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: skippedData,
                        totalCount: totalCount
                    })
                }else{
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: filtered,
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