module.exports = function (router) {

    var emailTemplate = require('./controllers/email_ctrl');

    // var utils = __rootRequire('app/lib/util');

    var utils = __rootRequire('app/lib/util');
    var middlewares = [utils.CheckUrl];

    //free auth
    router.post('/f/emailTemplate/addEmailTemplate', middlewares, emailTemplate.addEmailTemplate);

    return router;
}