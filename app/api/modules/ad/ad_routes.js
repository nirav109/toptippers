module.exports = function(router) {

    var ad = require('./controllers/ad_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.get('/ad/getAds', middlewares, ad.getAds);
    router.post('/ad/listAd', middlewares, ad.getAdList);
    router.post('/ad/addUpdateAd', middlewares, ad.addUpdateAd);
    router.post('/ad/deleteAd', middlewares, ad.deleteAd);





    return router;
}