module.exports = function (router) {

    var setting = require('./controllers/setting_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/setting/getSetting', middlewares, setting.getSetting);
    router.post('/setting/addupdateSetting', middlewares, setting.addupdateSetting);
    router.post('/setting/clearCurrentSession', middlewares, setting.clearCurrentSession);
    return router;
}