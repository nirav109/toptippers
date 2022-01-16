module.exports = function (router) {

    var content = require('./controllers/content_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/content/listContent', middlewares, content.getContentList);
    router.post('/content/addupdateContent', middlewares, content.addupdateContent);
    router.get('/content/getContent', middlewares, content.getContent);
    return router;
}