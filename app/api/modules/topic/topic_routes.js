module.exports = function (router) {

    var topic = require('./controllers/topic_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/topic/deleteTopic', middlewares, topic.deleteTopic);
    router.post('/topic/listTopic', middlewares, topic.getTopicList);
    router.post('/topic/addupdateTopic', middlewares, topic.addupdateTopic);
    router.get('/topic/getTopics', middlewares, topic.getTopics);
    return router;
}