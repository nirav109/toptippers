module.exports = function (router) {

    var aduser = require('./controllers/aduser_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/ad/updateAdClick', middlewares, aduser.updateAdClick);
    router.post('/ad/adReports', middlewares, aduser.getAdClicks);  
  
       
    return router;
}