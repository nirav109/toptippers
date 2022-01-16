'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    TOPIC = mongoose.model('topic'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addupdateTopic: addupdateTopic,
    deleteTopic: deleteTopic,
    getTopicList: getTopicList,
    getTopics: getTopics
};



/* Function is use to add/edit Sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function addupdateTopic(req, res) {
    async function asy_add_topic() {
        try {
                let topicId = req.body.topicId;
                if (!topicId) {
                    let condition_exist = {
                        topicname: req.body.topicname,
                        isDeleted: false
                    }
                    let topic_exist = await commonQuery.fetch_one(TOPIC, condition_exist)
                    if (topic_exist) {
                        return response(res, Constant.ALLREADY_EXIST, Constant.DATA_EXIST);
                    }
                    let topicdata = {
                        "topicname": req.body.topicname
                    }
                    let topic = await commonQuery.InsertIntoCollection(TOPIC, topicdata)
                    return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, topic);
                } else {
                    if (!mongoose.Types.ObjectId.isValid(topicId)) {
                        return res.json({
                            code: Constant.ERROR_CODE,
                            message: Constant.NOT_PROPER_DATA
                        });
                    }
                    let obj_update = {
                        topicname: req.body.topicname
                    }
                    let updateCondition = {
                        _id: topicId
                    };
                    let topicData = await commonQuery.updateOneDocument(TOPIC, updateCondition, obj_update)
                    if (topicData) {
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
    asy_add_topic();
}


/* Function is use to fetch list of all sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getTopicList(req, res) {
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
                    'topicname': new RegExp(search_string, 'gi')
                }
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(TOPIC, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            TOPIC.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, topicList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: topicList,
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

function getTopics(req, res) {
    async function asy_init() {
        try {
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let condition = { isDeleted: false }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(TOPIC, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            if(totalCount>0){
                TOPIC.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, topicList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }

                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, topicList, totalCount);
                })
            }else{
                return mresponse(res, Constant.ERROR_CODE, Constant.DATA_NOT_FOUND);
            }

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
function deleteTopic(req, res) {
    try {
        let topicId = req.body.topicId;
        if (!mongoose.Types.ObjectId.isValid(topicId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(TOPIC, {
            _id: topicId
        }, {
            isDeleted: true
        }).then(function (response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_DATA_SUCCESS,
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

