module.exports = function(router) {

    var user = require('./controllers/user_ctrl');
    // var utils = __rootRequire('app/lib/util');
    var utils = require('../../../lib/util');
    var middlewares = [utils.CheckUrl];
    router.post('/f/user/register', middlewares, user.registerUser);
    router.post('/f/user/registerUser', middlewares, user.registerUser);
    router.post('/f/user/userLogin', middlewares, user.userLogin);
    router.post('/f/user/userLogout', middlewares, user.userLogout);
    router.post('/f/user/userAdminLogin', middlewares, user.userAdminLogin);
    router.post('/user/listUser', middlewares, user.getUserList);
    router.post('/user/listAllUser', middlewares, user.getAllUserList);
    router.post('/f/user/forgotPassword', middlewares, user.forgotPassword);
    router.post('/f/user/resetPassword', middlewares, user.resetPassword);
    router.post('/user/changePassword', middlewares, user.changePassword);
    router.post('/user/addUser', middlewares, user.addUser);
    router.post('/user/deleteUser', middlewares, user.deleteUser);
    router.post('/user/updateUser', middlewares, user.updateUser);
    router.post('/user/getUserDetails', middlewares, user.getUserDetails);
    router.post('/user/updateProfilePic', middlewares, user.updateProfilePic);
    router.post('/user/deActivateUser', middlewares, user.deActivateUser);
    router.get('/user/getAuthDetails', middlewares, user.getAuthDetails);
    router.get('/f/user/getFindUsers', middlewares, user.getFindUsers);
    router.post('/user/updateFavCompetition', middlewares, user.updateFavCompetition);
    router.post('/user/updateFavSport', middlewares, user.updateFavSport);
    router.post('/user/updateProfile', middlewares, user.updateName);
    router.post('/user/updateKingBotNotification', middlewares, user.updateKingBotNotification);
    router.post('/user/inviteUsers', middlewares, user.inviteUsers);
    // router.post('/user/getEmailVerificationLink', middlewares, user.getEmailVerificationLink);
    router.get('/f/user/verifyEmail', user.verifyEmail);
    router.post('/user/verifyUser', middlewares, user.verifiedAccount);
    router.post('/user/sendMessage', middlewares, user.sendMessage);
    router.post('/user/deleteUsers', middlewares, user.deleteUsers);

    router.post('/user/addUserSports', middlewares, user.addUserSports);


    return router;
}