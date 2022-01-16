'use strict';

var mongoose = require('mongoose'),
    request = require('request'),
    xml2js = require('xml2js'),
    Constant = require('../../../../config/constant.js'),
    config = require('../../../../config/config.js').get(process.env.NODE_ENV),
    GAME = mongoose.model('game'),
    TEAM = mongoose.model('team'),
    TIPPING = mongoose.model('tipping'),
    ROUND = mongoose.model('round'),
    SPORT = mongoose.model('sport'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    utility = require('../../../../lib/utility.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

//let parser = new Parser();
var parser = new xml2js.Parser();



module.exports = {
    addGame: addGame,
    getGameList: getGameList,
    getGameDetails: getGameDetails,
    deleteGame: deleteGame,
    updateGame: updateGame,
    getGames: getGames,
    updateGameSeason: updateGameSeason,
    getTeamLadder: getTeamLadder,
    getFormGuide: getFormGuide,
    updateTopTippersGamePoints: updateTopTippersGamePoints

};


/* Function is use to add New Game
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function addGame(req, res) {
    async function asy_add_Game() {

        try {
            let gameId = req.body.gameId;

            if (!gameId) {

                let condition_exist = {
                    sport: req.body.sport,
                    gameDate: req.body.date,
                    gameTime: req.body.time,
                    isDeleted: false
                }
                let game_exist = await commonQuery.fetch_one(GAME, condition_exist)
                if (game_exist) {

                    return response(res, Constant.ALLREADY_EXIST, Constant.GAME_EXIST);
                }

                let gamedata = {
                    "sport": req.body.sport,
                    "gameDate": req.body.date,
                    "gameTime": req.body.time,
                    "gameState": req.body.gameState,
                    "round": req.body.round,
                    "points": req.body.points,
                    "homeTeamPoints": req.body.homeTeamPoints,
                    "awayTeamPoints": req.body.awayTeamPoints,
                    "homeSeasonPoints": req.body.homeSeasonPoints,
                    "awaySeasonPoints": req.body.awaySeasonPoints,
                    "homeTeam": req.body.homeTeam,
                    "awayTeam": req.body.awayTeam,
                    "eventId": req.body.eventId,
                    "winningTeam": req.body.winningTeam,
                    "gameDate": req.body.date,
                    "gameTime": req.body.time,
                    "season": req.body.season
                }
                let gameData = await commonQuery.InsertIntoCollection(GAME, gamedata)

                return res.json({
                    code: Constant.SUCCESS_CODE,
                    data: gameData,
                    message: Constant.GAME_DATA_ADDED,
                });
            } else {
                if (!mongoose.Types.ObjectId.isValid(gameId)) {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
                let obj_update = {
                    "gameState": req.body.gameState
                }
                let updateCondition = {
                    _id: gameId
                };
                let gamesData = await commonQuery.updateOneDocument(GAME, updateCondition, obj_update)
                if (gamesData) {

                    request({
                        uri: config.baseUrl + "api/tipping/addAutoTipping",
                        qs: {
                            gameId: gameId
                        },
                        function(error, response, body) {
                            if (!error && response.statusCode === 200) {
                                console.log(body);
                                res.json(body);
                            } else {
                                res.json(error);
                            }
                        }
                    });

                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        data: {},
                        message: Constant.GAME_STATE_UPDATED,
                    });


                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.GAME_UPDATED_UNSUCCESS
                    });
                }
            }

        } catch (err) {
            return response(res, Constant.ERROR_CODE, err);
        };


    }
    asy_add_Game();
}

/* Function is use to get game list
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getGameList(req, res) {
    async function asy_init() {
        try {
            let count = req.body.count ? parseInt(req.body.count) : 5;
            let skip = 0;
            let page = req.body.page ? req.body.page : 0;
            if (count && page) {
                skip = count * (page);
                // skip = count * (page - 1);
            }
            let search_string = req.body.search_string;
            let condition = {
                isDeleted: false,
                season: req.body.season
            }
            if (req.body.search_string) {
                condition['$or'] = [{
                    'gameTitle': new RegExp(search_string, 'gi')
                }]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(GAME, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }
            let query = GAME.find(condition)
            query.populate({
                path: 'sport',
                select: 'sportname type',
            }).populate({
                path: 'round',
                select: 'roundno roundname startDate endDate',
            }).populate({
                path: 'homeTeam',
                select: 'teamname teamLogo',
            }).populate({
                path: 'awayTeam',
                select: 'teamname teamLogo',
            }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, gameList) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: gameList,
                    totalCount: totalCount
                })
            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}

/* Function is use to getGameDetails
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */


function getGameDetails(req, res) {
    async function asy_init() {
        try {
            let condition = {
                _id: req.body.gameId
            }
            GAME.findOne(condition).populate({
                path: 'sport',
                select: 'sportname type',
            }).populate({
                path: 'homeTeam',
                select: 'teamname teamLogo',
            }).populate({
                path: 'awayTeam',
                select: 'teamname teamLogo',
            }).exec(async function(err, gameDetail) {
                // compDetail.bonus
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCHED,
                    data: gameDetail
                })
            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_init();
}


/* Function is use to delete game record
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function deleteGame(req, res) {
    try {
        let gameId = req.body.gameId;
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(GAME, {
            _id: gameId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_GAME_SUCCESS,
            });
        }).catch(function(err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        })

    } catch (err) {
        return res.json({
            code: Constant.REQ_DATA_ERROR_CODE,
            message: Constant.SOMETHING_WENT_WRONG
        });
    }
}

/* Function is use to edit game detail
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateGame(req, res) {
    async function asy_initUpdate() {
        try {
            let gameId = req.body.gameId;
            if (!mongoose.Types.ObjectId.isValid(gameId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                gameDate: req.body.gameDate,
                gameTime: req.body.gameTime,
                sport: req.body.sport,
                round: req.body.round,
                homeTeam: req.body.homeTeam,
                awayTeam: req.body.awayTeam,
                points: req.body.points,
                homeTeamPoints: req.body.homeTeamPoints,
                awayTeamPoints: req.body.awayTeamPoints,
                homeSeasonPoints: req.body.homeSeasonPoints,
                awaySeasonPoints: req.body.awaySeasonPoints,
                eventId: req.body.eventId,
                winningTeam: req.body.winningTeam,
                gameState: req.body.gameState
            }

            let updateCondition = {
                _id: gameId
            };
            let gameData = await commonQuery.updateOneDocument(GAME, updateCondition, obj_update)
            if (gameData && obj_update.gameState == "finished") {

                request({
                    uri: config.baseUrl + "api/kingbot/sendGameNotification",
                    qs: {
                        roundId: req.body.round
                    },
                    function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            res.json(body);
                        } else {
                            res.json(error);
                        }
                    }
                });

                request({
                    uri: config.baseUrl + "api/tipping/addAutoTipping",
                    qs: {
                        gameId: gameId
                    },
                    function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            res.json(body);
                        } else {
                            res.json(error);
                        }
                    }
                });

                request({
                    uri: config.baseUrl + "api/ladder/updateUserCompGamePoints",
                    qs: {
                        sportId: req.body.sport,
                        gameId: gameId
                    },
                    timeout: 3000000,
                    function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            console.log(body);
                            res.json(body);
                        } else {
                            console.log(error);
                            res.json(error);
                        }
                    }
                });

                return res.json({
                    code: Constant.SUCCESS_CODE,
                    data: {},
                    message: Constant.GAME_UPDATED_SUCCESS,
                });

            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.GAME_UPDATED_UNSUCCESS
                });
            }
        } catch (err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_initUpdate();
}


/* Function is use to get game list
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getGames(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.roundId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let condition = {
                isDeleted: false,
                round: req.query.roundId,
                season: "current"
            }
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let sortObject = { gameDate: 1 } //1 asc -1 desc

            let totalCount = await commonQuery.countData(GAME, condition);
            if (totalCount > 0) {
                let query = GAME.find(condition)
                query.populate({
                    path: 'sport',
                    select: 'sportname',
                }).populate({
                    path: 'round',
                    select: 'roundno roundname',
                }).populate({
                    path: 'homeTeam',
                    select: 'teamname teamLogo',
                }).populate({
                    path: 'awayTeam',
                    select: 'teamname teamLogo',
                }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, gameList) {
                    if (err) {
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    } else {
                        (async() => {
                            for (let i = 0; i < gameList.length; i++) {
                                let tipping_condition = {
                                    game: gameList[i]._id,
                                    user: req.query.userId
                                }
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                gameList[i].winningTeam = gameList[i].winningTeam.toLowerCase();
                                gameList[i].timezone = "Australia/Sydney";
                                let gameTime = new Date(gameList[i].gameTime);
                                let gameDateTime = new Date(gameList[i].gameDate);
                                gameDateTime.setHours(gameTime.getHours(), gameTime.getMinutes(), gameTime.getSeconds());
                                gameList[i].gameDate = gameDateTime;
                                if (tipping) {
                                    gameList[i].lastTipping = tipping.bettingTeam;
                                } else {
                                    gameList[i].lastTipping = "";
                                }

                            }
                            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, gameList, totalCount);

                        })();


                    }
                })
            } else {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, [], totalCount);

            }


        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}


function updateGameSeason(req, res) {
    async function asy_initUpdate() {
        try {

            let updateConditionPast = {
                season: 'past',
                isDeleted: false
            };
            let obj_update_past = {
                isDeleted: true,
            }

            let updatePast = await commonQuery.updateAllDocument(GAME, updateConditionPast, obj_update_past);
            console.log("updatepast: " + JSON.stringify(updatePast));

            if (updatePast) {
                let updateConditionCurrent = {
                    season: 'current',
                    isDeleted: false
                };
                let obj_update_current = {
                    "season": 'past'
                }

                let updateCurrent = await commonQuery.updateAllDocument(GAME, updateConditionCurrent, obj_update_current);

                console.log("updateCurrent: " + JSON.stringify(updateCurrent));

                if (updateCurrent) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        data: {},
                        message: Constant.GAME_UPDATED_SUCCESS,
                    });
                }


            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.GAME_UPDATED_UNSUCCESS
                });
            }




        } catch (err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_initUpdate();
}

function getTeamLadder(req, res) {
    async function asy_init() {
        try {
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let game_condition = {
                isDeleted: false,
                season: "current",
                sport: req.query.sportId
            }
            let team_condition = {
                isDeleted: false,
                sport: req.query.sportId
            }

            let totalCount = await commonQuery.countData(TEAM, team_condition);
            let teamquery = TEAM.find(team_condition);
            teamquery.populate({
                path: 'sport',
                select: 'sportname',
            }).skip(skip).limit(count).lean().exec(function(err, teamList) {
                (async() => {
                    for (let j = 0; j < teamList.length; j++) {
                        let totalPoint = 0;
                        let results = [];
                        game_condition['$or'] = [{
                                homeTeam: teamList[j]._id
                            },
                            {
                                awayTeam: teamList[j]._id
                            }

                        ]
                        let teamGameList = await commonQuery.findData(GAME, game_condition);
                        for (let i = 0; i < teamGameList.data.length; i++) {
                            if ((teamGameList.data[i].winningTeam.toLowerCase() == "home" && teamGameList.data[i].homeTeam.equals(teamList[j]._id)) || (teamGameList.data[i].winningTeam.toLowerCase() == "away" && teamGameList.data[i].awayTeam.equals(teamList[j]._id))) {
                                totalPoint += teamGameList.data[i].points;
                                if (results.length <= 4) {
                                    results.push("W");
                                }
                            } else if (teamGameList.data[i].winningTeam.toLowerCase() == "draw") {
                                totalPoint += teamGameList.data[i].points / 2;
                                if (results.length <= 4) {
                                    results.push("D");
                                }
                            } else {
                                if (results.length <= 4) {
                                    results.push("L");
                                }
                            }
                        }
                        teamList[j].results = results;
                        teamList[j].points = totalPoint;

                    }
                    teamList.sort((a, b) => b.points - a.points);


                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: teamList,
                        totalCount: totalCount
                    })

                })();

            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}


function getFormGuide(req, res) {
    async function asy_init() {
        try {
            let condition = {
                isDeleted: false,
                season: "current",
                sport: req.query.sportId
            }
            condition['$or'] = [{
                    homeTeam: req.query.homeTeamId,
                    awayTeam: req.query.awayTeamId
                },
                {
                    awayTeam: req.query.homeTeamId,
                    homeTeam: req.query.awayTeamId
                }
            ];

            let homeResults = [];
            let awayResults = [];

            let homeTeam = {
                _id: "",
                teamname: "",
                teamLogo: "",
                winningPercentage: 0,
                results: [],
            }
            let awayTeam = {
                _id: "",
                teamname: "",
                teamLogo: "",
                winningPercentage: 0,
                results: [],
            }

            let query = GAME.find(condition);
            query.populate({
                path: 'sport',
                select: 'sportname',
            }).populate({
                path: 'round',
                select: 'roundno roundname',
            }).populate({
                path: 'homeTeam',
                select: 'teamname teamLogo',
            }).populate({
                path: 'awayTeam',
                select: 'teamname teamLogo',
            }).lean().exec(function(err, gameList) {

                gameList.map(game => {
                    if (game.homeTeam._id.equals(req.query.homeTeamId) && game.awayTeam._id.equals(req.query.awayTeamId)) {
                        homeTeam._id = game.homeTeam._id;
                        homeTeam.teamname = game.homeTeam.teamname;
                        homeTeam.teamLogo = game.homeTeam.teamLogo;
                        awayTeam._id = game.awayTeam._id;
                        awayTeam.teamname = game.awayTeam.teamname;
                        awayTeam.teamLogo = game.awayTeam.teamLogo;
                        if (game.winningTeam.toLowerCase() == "home") {
                            homeResults.push("W");
                            awayResults.push("L");
                        } else if (game.winningTeam.toLowerCase() == "away") {
                            homeResults.push("L");
                            awayResults.push("W");
                        } else {
                            homeResults.push("D");
                            awayResults.push("D");
                        }
                    } else {
                        homeTeam._id = game.awayTeam._id;
                        homeTeam.teamname = game.awayTeam.teamname;
                        homeTeam.teamLogo = game.awayTeam.teamLogo;
                        awayTeam._id = game.homeTeam._id;
                        awayTeam.teamname = game.homeTeam.teamname;
                        awayTeam.teamLogo = game.homeTeam.teamLogo;
                        if (game.winningTeam.toLowerCase() == "home") {
                            homeResults.push("L");
                            awayResults.push("W");
                        } else if (game.winningTeam.toLowerCase() == "away") {
                            homeResults.push("W");
                            awayResults.push("L");
                        } else {
                            homeResults.push("D");
                            awayResults.push("D");
                        }
                    }
                });

                homeTeam.results = homeResults.length > 4 ? homeResults.slice(0, 4) : homeResults;
                awayTeam.results = awayResults.length > 4 ? awayResults.slice(0, 4) : awayResults;
                homeTeam.winningPercentage = homeResults.filter(data => data == "W").length / gameList.length * 100;
                awayTeam.winningPercentage = awayResults.filter(data => data == "W").length / gameList.length * 100;


                let data = {
                    home: homeTeam,
                    away: awayTeam
                }

                return res.json({
                    code: Constant.SUCCESS_CODE,
                    message: Constant.DATA_FETCH_SUCCESS,
                    data: data,
                })




            })
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}


function updateTopTippersGamePoints(req, res) {
    async function asy_initUpdate() {
        try {
            function httpGet(url) {
                return new Promise((resolve, reject) => {
                    const http = require('http'),
                        https = require('https');

                    let client = http;

                    if (url.toString().indexOf("https") === 0) {
                        client = https;
                    }

                    client.get(url, (resp) => {
                        let chunks = [];

                        // A chunk of data has been recieved.
                        resp.on('data', (chunk) => {
                            chunks.push(chunk);
                        });

                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            resolve(Buffer.concat(chunks));
                        });

                    }).on("error", (err) => {
                        reject(err);
                    });
                });
            }

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate) {
                var from = new Date(startDate); // -1 because months are from 0 to 11
                from.setHours(0, 0, 0, 0);
                var to = new Date(endDate);
                to.setHours(23, 55, 0, 0);
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);

                if (check > to) {
                    return 0;
                } else if (check < from) {
                    return 2
                } else {
                    return 1;
                }

            }

            let aflGames = [];
            let nrlGames = [];
            let currentDate = new Date();




            //For AFL
            (async(url) => {
                var buf = await httpGet(url);
                parser.parseString(buf, function(err, result) {
                    result.TOP_Odds_Feed2.EventType.forEach((r) => {
                        aflGames.push(r.Event[0]);
                    })
                });
                // console.log(buf.toString('utf-8'));
            })('https://feeds.topsport.com.au/sport_feed.asp?whichsport=aussie%20rules');

            //For NRL
            (async(url) => {
                var buf = await httpGet(url);
                parser.parseString(buf, function(err, result) {
                    result.TOP_Odds_Feed2.EventType.forEach((r) => {
                        nrlGames.push(r.Event[0]);
                    })
                });
                // console.log(buf.toString('utf-8'));
            })('https://feeds.topsport.com.au/sport_feed.asp?whichsport=rugby%20league');

            let sport_condition = {
                isDeleted: false
            }

            let sports = await commonQuery.findData(SPORT, sport_condition);

            setTimeout(async function() {
                //your code to be executed after 1 second
                for (let i = 0; i < sports.data.length; i++) {
                    let round_condition = {
                        isDeleted: false,
                        sport: sports.data[i]._id
                    }

                    let rounds = await commonQuery.findData(ROUND, round_condition);

                    for (let j = 0; j < rounds.data.length; j++) {

                        if (isDateBetween(rounds.data[j].startDate, rounds.data[j].endDate, currentDate) == 1) {

                            let game_condition = {
                                isDeleted: false,
                                round: rounds.data[j]._id
                            }

                            console.log("CURRENT ROUND: ", rounds.data[j]);

                            let games = await commonQuery.findData(GAME, game_condition);

                            for (let k = 0; k < games.data.length; k++) {

                                if (games.data[k].gameState == "open") {
                                    console.log("OPEN GAME: ", games.data[k]);
                                    console.log("SPORT: ", sports.data[i]);
                                    if (sports.data[i].sportname == "AFL") {
                                        console.log("aflGamesLength: ", aflGames.length);
                                        if (aflGames.find(a => a.$.EventID == games.data[k].eventId)) {
                                            let homeTopTipperPoints = parseFloat(aflGames.find(a => a.$.EventID == games.data[k].eventId).Selection[0].Odds[0]);
                                            let awayTopTipperPoints = parseFloat(aflGames.find(a => a.$.EventID == games.data[k].eventId).Selection[1].Odds[0]);
                                            let updateCondition = {
                                                _id: games.data[k]._id,
                                                isDeleted: false
                                            };
                                            let obj_update = {
                                                homeTopTipperPoints: homeTopTipperPoints,
                                                awayTopTipperPoints: awayTopTipperPoints
                                            }

                                            console.log("AFL GAME UPDATE: ", obj_update);


                                            let updateTopTippersGamePoints = await commonQuery.updateAllDocument(GAME, updateCondition, obj_update);
                                        }


                                    } else {
                                        console.log("nrlGamesLength: ", nrlGames.length);
                                        if (nrlGames.find(a => a.$.EventID == games.data[k].eventId)) {
                                            let homeTopTipperPoints = parseFloat(nrlGames.find(a => a.$.EventID == games.data[k].eventId).Selection[0].Odds[0]);
                                            let awayTopTipperPoints = parseFloat(nrlGames.find(a => a.$.EventID == games.data[k].eventId).Selection[1].Odds[0]);
                                            let updateCondition = {
                                                _id: games.data[k]._id,
                                                isDeleted: false
                                            };
                                            let obj_update = {
                                                homeTopTipperPoints: homeTopTipperPoints,
                                                awayTopTipperPoints: awayTopTipperPoints
                                            }

                                            console.log("NRL GAME UPDATE: ", obj_update);


                                            let updateTopTippersGamePoints = await commonQuery.updateAllDocument(GAME, updateCondition, obj_update);
                                        }

                                    }
                                }
                            }

                        }

                    }

                }
            }, 60000);





        } catch (err) {
            return res.json({
                code: Constant.REQ_DATA_ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_initUpdate();
}