'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    CONTENT = mongoose.model('content'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addupdateContent: addupdateContent,
    getContentList: getContentList,
    getContent: getContent
};



/* Function is use to add/edit Sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function addupdateContent(req, res) {
    async function asy_add_content() {
        try {
                let contentId = req.body.contentId;
                if (!contentId) {
                    let condition_exist = {
                        content: req.body.content,
                        isDeleted: false
                    }
                    let content_exist = await commonQuery.fetch_one(CONTENT, condition_exist)
                    if (content_exist) {
                        return response(res, Constant.ALLREADY_EXIST, Constant.DATA_EXIST);
                    }
                    let contentdata = {
                        "content": req.body.content
                    }
                    let content = await commonQuery.InsertIntoCollection(CONTENT, contentdata)
                    return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, content);
                } else {
                    if (!mongoose.Types.ObjectId.isValid(contentId)) {
                        return res.json({
                            code: Constant.ERROR_CODE,
                            message: Constant.NOT_PROPER_DATA
                        });
                    }
                    let obj_update = {
                        content: req.body.content
                    }
                    let updateCondition = {
                        _id: contentId
                    };
                    let contentData = await commonQuery.updateOneDocument(CONTENT, updateCondition, obj_update)
                    if (contentData) {
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
                }
            

        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_content();
}


/* Function is use to fetch list of all sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getContentList(req, res) {
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
                    'content': new RegExp(search_string, 'gi')
                }
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(CONTENT, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            CONTENT.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, contentList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: contentList,
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


function getContent(req, res) {
    async function asy_init() {
        try {

            if(!req.query.contentType){
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let condition = { isDeleted: false, contentType: req.query.contentType };
            let totalCount = await commonQuery.countData(CONTENT, condition);
            if(totalCount>0){
                CONTENT.find(condition).lean().exec(function (err, contentList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, contentList);
                })
            }else{
                return mresponse(res, Constant.ERROR_CODE, Constant.DATA_NOT_FOUND);
            }


        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}

