module.exports = function(router) {

    var season = require('./controllers/start_season_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post("/season/addSeason", middlewares, season.addNewSeason);
    router.post("/season/getSeasonList", middlewares, season.getSeasonList);
    router.post("/season/deleteSeason", middlewares, season.deleteSeason);
    router.post("/season/blockSeason", middlewares, season.blockSeason);
    router.post("/season/getTeamDetail", middlewares, season.getSeasonDetails)
    return router;
}