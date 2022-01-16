module.exports = function(router) {

    var sport = require('./controllers/sport_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/sport/addSport', middlewares, sport.addSport);
    router.post('/sport/listSport', middlewares, sport.getSportList);
    router.post('/sport/deleteSport', middlewares, sport.deleteSport);
    router.post('/sport/updateSport', middlewares, sport.updateSport);
    router.post('/sport/getSportDetail', middlewares, sport.getSportDetails);
    router.post('/sport/addupdateSport', middlewares, sport.addupdateSport);
    router.post('/sport/Filter', middlewares, sport.getSportSeason);
    router.get('/sport/getSports', middlewares, sport.getSports);

    return router;
}