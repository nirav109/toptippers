module.exports = function (router) {

    var kingbot = require('./controllers/kingbot_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.get('/kingbot/sendGameNotification', kingbot.sendGameNotification);
    router.post('/kingbot/sendGameStartNotification', middlewares, kingbot.sendGameStartNotification);
    router.get('/kingbot/updateGameState', kingbot.updateGameState);
    return router;
}