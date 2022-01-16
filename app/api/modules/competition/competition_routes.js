module.exports = function (router) {

    var comp = require('./controllers/comp_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/competition/addCompetition', middlewares, comp.addCompetition);
    router.post('/competition/listCompetition', middlewares, comp.getCompetitionList);
    router.post('/competition/listCompetitionbyId', middlewares, comp.getCompListbyCreatorId);
    router.post('/competition/getCompetitionDetails', middlewares, comp.getCompetitionDetails);
    router.post('/competition/getCompListbySportId', middlewares, comp.getCompListbySportId);
    router.post('/competition/getCompListbySportandUserId', middlewares, comp.getCompListbySportandUserId);
    router.post('/competition/joinCompetition', middlewares, comp.joinCompetition);
    router.post('/competition/getMycompList', middlewares, comp.getMycompList);
    router.post('/competition/leaveCompetition', middlewares, comp.leaveCompetition);
    router.get('/competition/getJoinedCompetitions', middlewares, comp.getJoinedCompetitions);
    router.get('/competition/validateCompetition', middlewares, comp.validateCompetition);
    router.get('/competition/getFindCompetitions', middlewares, comp.getFindCompetitions);
    router.get('/competition/getJoinedBonusCompetitions', middlewares, comp.getJoinedBonusCompetitions);
    router.post('/competition/deleteCompetition', middlewares, comp.deleteCompetition);


    return router;
}