'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    QUESTION = mongoose.model('question'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    addupdateQuestion: addupdateQuestion,
    deleteQuestion: deleteQuestion,
    getQuestionList: getQuestionList,
    getQuestions: getQuestions
};



/* Function is use to add/edit Sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function addupdateQuestion(req, res) {
    async function asy_add_question() {
        try {
                let questionId = req.body.questionId;
                if (!questionId) {
                    let condition_exist = {
                        question: req.body.question,
                        answer: req.body.answer,
                        isDeleted: false
                    }
                    let question_exist = await commonQuery.fetch_one(QUESTION, condition_exist)
                    if (question_exist) {
                        return response(res, Constant.ALLREADY_EXIST, Constant.DATA_EXIST);
                    }
                    let questiondata = {
                        "question": req.body.question,
                        "answer": req.body.answer,
                        "topic": req.body.topicId,
                    }
                    let question = await commonQuery.InsertIntoCollection(QUESTION, questiondata)
                    return response(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS, question);
                } else {
                    if (!mongoose.Types.ObjectId.isValid(questionId)) {
                        return res.json({
                            code: Constant.ERROR_CODE,
                            message: Constant.NOT_PROPER_DATA
                        });
                    }
                    let obj_update = {
                        question: req.body.question,
                        answer: req.body.answer,
                        topic: req.body.topicId
                    }
                    let updateCondition = {
                        _id: questionId
                    };
                    let questionData = await commonQuery.updateOneDocument(QUESTION, updateCondition, obj_update)
                    if (questionData) {
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
    asy_add_question();
}


/* Function is use to fetch list of all sport
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getQuestionList(req, res) {
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
                    'question': new RegExp(search_string, 'gi')
                }
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(QUESTION, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            QUESTION.find(condition).populate({
                path: 'topic',
                select: 'topicname',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, questionList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: questionList,
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
function deleteQuestion(req, res) {
    try {
        let questionId = req.body.questionId;
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(QUESTION, {
            _id: questionId
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

function getQuestions(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.topicId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let condition = { isDeleted: false, topic: req.query.topicId}
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(QUESTION, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            QUESTION.find(condition).sort(sortObject).skip(skip).limit(count).lean().exec(function (err, topicList) {
                if(err){
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }
                if(totalCount>0){
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, topicList, totalCount);

                }else{
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, topicList, totalCount);

                }
            })


        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}

