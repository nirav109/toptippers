module.exports = function(router) {

    var team = require('./controllers/team_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/team/addTeam', middlewares, team.addTeam);
    router.post('/team/getTeamlist', middlewares, team.getTeamList);
    router.post('/team/getTeamListbySportId', middlewares, team.getTeamListbySportId);
    router.post('/team/deleteTeam', middlewares, team.deleteTeam);
    router.post('/team/updateTeam', middlewares, team.updateTeam);
    router.post('/team/getTeamDetail', middlewares, team.getTeamDetails);
    router.post('/team/blockTeam', middlewares, team.blockTeam);
    router.post('/team/updateTeamLogo', middlewares, team.updateTeamLogo);
    return router;
}