'use strict';
var mongoose = require('mongoose'),
    response = require('../../../../lib/response_handler'),
    EmailTemplateModel = mongoose.model('emailTemplate'),
    Constant = require('../../../../config/constant.js'),
    commonQuery = require('../../../../lib/commonQuery');


module.exports = {

    addEmailTemplate: addEmailTemplate,

}
/**
 * Function is use to list email template
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addEmailTemplate(req, res) {
    async function asy_page() {
        try {
            if (req.body.title && req.body.template_code && req.body.body && req.body.subject) {
                let obj = {
                    title: req.body.title,
                    template_code: req.body.template_code,
                    body: req.body.body,
                    subject: req.body.subject
                }
                commonQuery.InsertIntoCollection(EmailTemplateModel, obj)
                    .then((result) => {
                        if (result) {
                            return response(res, Constant.SUCCESS_CODE, Constant.EMAILTEMPLATE_SAVE_SUCCESS);
                        } else {
                            return response(res, Constant.ERROR_CODE, Constant.EMAILTEMPLATE_SAVE_UNSUCCESS);
                        }
                    }).catch((err) => {
                        return response(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    })
            } else {
                return response(res, Constant.REQ_DATA_ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_page().then(dat => { });
}