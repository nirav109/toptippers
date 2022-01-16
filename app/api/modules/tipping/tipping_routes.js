module.exports = function (router) {

    var tipping = require('./controllers/tipping_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/tipping/addTipping', middlewares, tipping.saveTipping);
    router.get('/tipping/addAutoTipping', tipping.addAutoTipping);
    return router;
}