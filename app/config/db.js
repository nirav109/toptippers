'use strict';
var mongoose = require('mongoose');

//All models schema test
__rootRequire("app/api/modules/user/model/userSchema");
__rootRequire("app/api/modules/user/model/userSportsSchema");
__rootRequire("app/api/modules/email_templates/model/emailSchema");
__rootRequire("app/api/modules/role/model/roleSchema");
__rootRequire("app/api/modules/sport/model/sportSchema");
__rootRequire("app/api/modules/competition/model/compSchema");
__rootRequire("app/api/modules/competition/model/joinCompSchema");
__rootRequire("app/api/modules/team/model/teamSchema");
__rootRequire("app/api/modules/bonus/model/bonusSchema");
__rootRequire("app/api/modules/bonus/model/userBonusSchema");
__rootRequire("app/api/modules/game/model/gameSchema");
__rootRequire("app/api/modules/round/model/roundSchema");
__rootRequire("app/api/modules/topic/model/topicSchema");
__rootRequire("app/api/modules/question/model/questionSchema");
__rootRequire("app/api/modules/content/model/contentSchema");
__rootRequire("app/api/modules/device/model/deviceSchema");
__rootRequire("app/api/modules/tipping/model/tippingSchema");
__rootRequire("app/api/modules/setting/model/settingSchema");
__rootRequire("app/api/modules/aduser/model/aduserSchema");
__rootRequire("app/api/modules/ad/model/adSchema");
__rootRequire("app/api/modules/StartNewSeason/model/startseasonSchema")



// require("../api/modules/user/models/user_models");


if (!process.env.NODE_ENV || process.env.NODE_ENV == undefined) {
    process.env.NODE_ENV = 'staging';
}

console.log("Node environment is:", process.env.NODE_ENV)
const config = require('./config.js').get(process.env.NODE_ENV);
var options = {
    user: config.DATABASE.username,
    pass: config.DATABASE.password
};

console.log("dburl", config.DATABASE.host + config.DATABASE.port + "/" + config.DATABASE.dbname)
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE.host + config.DATABASE.port + "/" + config.DATABASE.dbname, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// console.log("dburl", process.env.dbhost + process.env.dbport + "/" + process.env.dbname)
// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.dbhost + process.env.dbport + "/" + process.env.dbname);
var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection failed"));
db.once('open', function() {
    console.log("Database connected successfully!");
});