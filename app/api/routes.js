module.exports = function(express) {
    var router = express.Router()
        // user
    require('./modules/user/user_routes')(router);
    //email_template
    require('./modules/email_templates/emailtemplate_routes')(router);
    //role
    require('./modules/role/role_routes')(router);
    //sport
    require('./modules/sport/sport_routes')(router);
    require('./modules/team/team_routes')(router);

    require('./modules/sport/sport_routes')(router);

    require('./modules/competition/competition_routes')(router);
    require('./modules/bonus/bonus_routes')(router);
    require('./modules/game/game_routes')(router);
    require('./modules/round/round_routes')(router);

    require('./modules/topic/topic_routes')(router);
    require('./modules/question/question_routes')(router);
    require('./modules/content/content_routes')(router);
    require('./modules/device/device_routes')(router);
    require('./modules/tipping/tipping_routes')(router);
    require('./modules/ladder/ladder_routes')(router);
    require('./modules/setting/setting_routes')(router);
    require('./modules/kingbot/kingbot_routes')(router);
    require('./modules/aduser/aduser_routes')(router);
    require('./modules/ad/ad_routes')(router);
    require('./modules/StartNewSeason/start_season_route')(router)






    return router;
}