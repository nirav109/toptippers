module.exports = function (router) {

    var ladder = require('./controllers/ladder_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.get('/ladder/getSeasonLadder', middlewares, ladder.getSeasonLadder);
    router.get('/ladder/getFormGuide', middlewares, ladder.getFormGuide);
    router.get('/ladder/getFormGuideHeadToHead', middlewares, ladder.getFormGuideHeadToHead);
    router.get('/ladder/getCompLadder', middlewares, ladder.getCompLadder);
    router.get('/ladder/getHeaterBonus', middlewares, ladder.getHeaterBonus);
    router.get('/ladder/getNewHome', middlewares, ladder.getNewHome);
    router.get('/ladder/getLiveGames', middlewares, ladder.getLiveGames);
    router.get('/ladder/updateUserCompPoints', ladder.updateUserCompPoints);
    router.get('/ladder/updateUserCompGamePoints', ladder.updateUserCompGamePoints);
    router.get('/ladder/resetCompUserGamePoints', ladder.resetCompUserGamePoints);
    router.get('/ladder/resetAllCompUserGamePoints', ladder.resetAllCompUserGamePoints);
    router.get('/ladder/updateJoinCompDelete', ladder.updateJoinCompDelete);








    return router;
}