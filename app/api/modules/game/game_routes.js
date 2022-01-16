module.exports = function (router) {

    var game = require('./controllers/games_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/game/addGames', middlewares, game.addGame);
    router.post('/game/listGames', middlewares, game.getGameList);
    router.post('/game/getGameDetails', middlewares, game.getGameDetails);
    router.post('/game/deleteGame', middlewares, game.deleteGame);
    router.post('/game/updateGame', middlewares, game.updateGame);
    router.get('/game/getGames', middlewares, game.getGames);
    router.post('/game/updateGameSeason', middlewares, game.updateGameSeason);
    router.get('/game/getTeamLadder', middlewares, game.getTeamLadder);
    router.get('/game/getFormGuide', middlewares, game.getFormGuide);
    router.get('/game/updateTopTippersGamePoints', game.updateTopTippersGamePoints);
    return router;
}