module.exports = function (router) {

    var role = require('./controllers/role_ctrl');
    var utils= require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/role/addRole', middlewares, role.addRole);
    return router;
}