module.exports = function (router) {

    var device = require('./controllers/device_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/f/user/updateToken', middlewares, device.updateToken);

    return router;
}