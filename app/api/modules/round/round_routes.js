module.exports = function (router) {

    var round = require('./controllers/round_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/round/addRound', middlewares, round.addRound);
    router.post('/round/deleteRound', middlewares, round.deleteRound);
    router.post('/round/blockRound', middlewares, round.blockRound);
    router.post('/round/getRoundDetail', middlewares, round.getRoundDetails);
    router.post('/round/listRounds', middlewares, round.getRoundList);
    router.post('/round/updateRound', middlewares, round.updateRound);
    router.get('/round/getRounds', middlewares, round.getRounds);
    router.get('/round/getCurrentRound', middlewares, round.getCurrentRound);


    return router;
}