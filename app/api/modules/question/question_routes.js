module.exports = function (router) {

    var question = require('./controllers/question_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/question/deleteQuestion', middlewares, question.deleteQuestion);
    router.post('/question/listQuestion', middlewares, question.getQuestionList);
    router.post('/question/addupdateQuestion', middlewares, question.addupdateQuestion);
    router.get('/question/getQuestions', middlewares, question.getQuestions);
    return router;
}