module.exports = function (router) {

    var bonus = require('./controllers/bonus_ctrl');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/bonus/addBonus', middlewares, bonus.addBonus);  
    router.post('/bonus/listBonus', middlewares, bonus.getBonusList);  
    router.post('/bonus/deleteBonus', middlewares, bonus.deleteBonus); 
    router.post('/bonus/addUserBonus', middlewares, bonus.addUserBonus);   

    
    return router;
}