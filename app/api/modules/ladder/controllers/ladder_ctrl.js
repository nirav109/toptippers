'use strict';

const request = require('request');

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    GAME = mongoose.model('game'),
    TEAM = mongoose.model('team'),
    TIPPING = mongoose.model('tipping'),
    SETTING = mongoose.model('setting'),
    COMP = mongoose.model('comp'),
    JOINCOMP = mongoose.model('joincomp'),
    USERBONUS = mongoose.model('userBonus'),
    USER = mongoose.model('user'),
    ROUND = mongoose.model('round'),
    ROLE = mongoose.model('role'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    utility = require('../../../../lib/utility.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    getSeasonLadder: getSeasonLadder,
    getFormGuide: getFormGuide,
    getFormGuideHeadToHead: getFormGuideHeadToHead,
    getCompLadder: getCompLadder,
    getNewHome: getNewHome,
    getHeaterBonus: getHeaterBonus,
    getLiveGames: getLiveGames,
    updateUserCompPoints: updateUserCompPoints,
    updateUserCompGamePoints: updateUserCompGamePoints,
    resetCompUserGamePoints: resetCompUserGamePoints,
    resetAllCompUserGamePoints: resetAllCompUserGamePoints,
    updateJoinCompDelete: updateJoinCompDelete

};

function getSeasonLadder(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
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
            let teams = [];
            teamquery.populate({
                path: 'sport',
                select: 'sportname',
            }).lean().exec(function (err, teamList) {
                (async  () => {
                    for(let j=0; j<teamList.length; j++){
                        let teamData = {
                            team: {},
                            results: [],
                            points: 0
                        }
                        let totalPoint = 0;
                        let totalSeasonPoint = 0;
                        let lossPoint = 0;
                        let lossSeasonPoint = 0;
                        let results = [];
                        game_condition['$or'] = [{
                            homeTeam: teamList[j]._id
                        },
                        {
                            awayTeam: teamList[j]._id
                        }
        
                        ]
                        let teamGameList = await commonQuery.findData(GAME, game_condition);
                        for(let i=0; i<teamGameList.data.length; i++){
                            if((teamGameList.data[i].winningTeam.toLowerCase()=="home" && teamGameList.data[i].homeTeam.equals(teamList[j]._id)) || (teamGameList.data[i].winningTeam.toLowerCase()=="away" && teamGameList.data[i].awayTeam.equals(teamList[j]._id))){
                                totalPoint += teamGameList.data[i].points;
                                totalSeasonPoint += teamGameList.data[i].homeSeasonPoints;
                                
                                results.push("W");
                                
                            }else if(teamGameList.data[i].winningTeam.toLowerCase()=="draw"){
                                totalPoint += teamGameList.data[i].points/2;
                                if(teamGameList.data[i].homeTeam.equals(teamList[j]._id)){
                                    totalSeasonPoint += teamGameList.data[i].homeSeasonPoints;
                                }else{
                                    totalSeasonPoint += teamGameList.data[i].awaySeasonPoints;
                                }
                                    results.push("D");
                            }else if(teamGameList.data[i].winningTeam.toLowerCase()!==""){
                                lossPoint += teamGameList.data[i].points;
                                lossSeasonPoint += teamGameList.data[i].awaySeasonPoints;

                                    results.push("L");
                            }
                        }
                        teamData.team = teamList[j];
                        teamList[j].results = results.length>4?results.slice(0,4):results;
                        teamList[j].points = totalPoint;
                        if(teamList[j].sport.sportname.trim()=="AFL"){
                            if(lossSeasonPoint<=0){
                                lossSeasonPoint = 1;
                            }
                            teamList[j].percentage = ((totalSeasonPoint/lossSeasonPoint)*100).toFixed(2);
                        }else if(teamList[j].sport.sportname.trim()=="NRL"){
                            teamList[j].percentage = totalSeasonPoint-lossSeasonPoint;

                        }

                }

                if(teamList.length>1){
                    teamList.sort((a, b) => b.points - a.points);
                }

                if(teamList.length>0){
                    teamList.slice(skip,skip+count);
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, teamList, totalCount);

                }else{
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, teamList, totalCount);

                }





            })();

            })
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}


function getFormGuide(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.gameId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let game_condition = { 
                isDeleted: false,
                _id: req.query.gameId
            }
            let sportId = "";
            let homeTeamId = "";
            let awayTeamId = "";

            let game_exist = await commonQuery.fetch_one(GAME, game_condition)
            if (game_exist) {
                sportId = game_exist.sport;
                homeTeamId = game_exist.homeTeam;
                awayTeamId = game_exist.awayTeam
            }else{
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);

            }

            let condition = { 
                isDeleted: false,
                season: "current",
                sport: sportId,
                // winningTeam: {$ne: ""} 
            }
            condition['$or'] = [{
                homeTeam: homeTeamId,
                awayTeam: awayTeamId
            },
            {
                awayTeam: homeTeamId,
                homeTeam: awayTeamId
            }];

            let homeResults = [];
            let awayResults = [];

            let homeTippingCount = 0;
            let awayTippingCount = 0;
            let totalTippingCount = 0;

            let homeTeam = {
                _id: "",
                teamname: "",
                teamLogo: "",
                winningPercentage: 0,
                results: [],
                rank: 0
            }
            let awayTeam = {
                _id: "",
                teamname: "",
                teamLogo: "",
                winningPercentage: 0,
                results: [],
                rank: 0
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
            }).lean().exec(function (err, gameList) {

                gameList.map(game=>{
                    if(game.homeTeam._id.equals(homeTeamId) && game.awayTeam._id.equals(awayTeamId)){
                        homeTeam._id = game.homeTeam._id;
                        homeTeam.teamname = game.homeTeam.teamname;
                        homeTeam.teamLogo = game.homeTeam.teamLogo;
                        awayTeam._id = game.awayTeam._id;
                        awayTeam.teamname = game.awayTeam.teamname;
                        awayTeam.teamLogo = game.awayTeam.teamLogo;
                        if(game.winningTeam.toLowerCase()=="home"){
                            homeResults.push("W");
                            awayResults.push("L");
                        }else if(game.winningTeam.toLowerCase()=="away"){
                            homeResults.push("L");
                            awayResults.push("W");
                        }else if(game.winningTeam.toLowerCase()=="draw"){
                            homeResults.push("D");
                            awayResults.push("D");
                        }
                    }else{
                        homeTeam._id = game.awayTeam._id;
                        homeTeam.teamname = game.awayTeam.teamname;
                        homeTeam.teamLogo = game.awayTeam.teamLogo;
                        awayTeam._id = game.homeTeam._id;
                        awayTeam.teamname = game.homeTeam.teamname;
                        awayTeam.teamLogo = game.homeTeam.teamLogo;
                        if(game.winningTeam.toLowerCase()=="home"){
                            homeResults.push("L");
                            awayResults.push("W");
                        }else if(game.winningTeam.toLowerCase()=="away"){
                            homeResults.push("W");
                            awayResults.push("L");
                        }else if(game.winningTeam.toLowerCase()=="draw"){
                            homeResults.push("D");
                            awayResults.push("D");
                        }
                    }
                });

                (async  () => {

                    let tipping_condition = { 
                        game: req.query.gameId
                    }
                    let tippings = await commonQuery.findData(TIPPING, tipping_condition);
                    totalTippingCount = tippings.data.length;
    
                    tippings.data.map(tipping=>{
                        if(tipping.bettingTeam=="home"){
                            homeTippingCount++;
                        }else{
                            awayTippingCount++;
                        }
                    })

                    homeTeam.results = homeResults.length>4?homeResults.slice(0,4):homeResults;
                    awayTeam.results = awayResults.length>4?awayResults.slice(0,4):awayResults;
                    homeTeam.winningPercentage = (homeTippingCount/totalTippingCount)*100;
                    awayTeam.winningPercentage = (awayTippingCount/totalTippingCount)*100;

                    let team_condition = { 
                        isDeleted: false,
                        sport: sportId 
                    }

                    let teamList = await commonQuery.findData(TEAM, team_condition);

                    for(let j=0; j<teamList.data.length; j++){
                        let totalPoint = 0;

                        let game_condition = { 
                            isDeleted: false,
                            season: "current",
                            sport: sportId 
                        }
                        game_condition['$or'] = [{
                            homeTeam: teamList.data[j]._id
                        },
                        {
                            awayTeam: teamList.data[j]._id
                        }
        
                        ]
                        let teamGameList = await commonQuery.findData(GAME, game_condition);
                        for(let i=0; i<teamGameList.data.length; i++){
                            if((teamGameList.data[i].winningTeam.toLowerCase()=="home" && teamGameList.data[i].homeTeam.equals(teamList.data[j]._id)) || (teamGameList.data[i].winningTeam.toLowerCase()=="away" && teamGameList.data[i].awayTeam.equals(teamList.data[j]._id))){
                                totalPoint += teamGameList.data[i].points;
                            }else if(teamGameList.data[i].winningTeam.toLowerCase()=="draw"){
                                totalPoint += teamGameList.data[i].points/2;
                            }
                        }
                        teamList.data[j].points = totalPoint;

                    }

                    if(teamList.data.length>1){
                        teamList.data.sort((a, b) => b.points - a.points);
                    }

                    homeTeam.rank = teamList.data.findIndex(team=>team._id.equals(homeTeamId))+1;
                    awayTeam.rank = teamList.data.findIndex(team=>team._id.equals(awayTeamId))+1;

    
    
    
                    let data = {
                        home: homeTeam,
                        away: awayTeam
                    }

                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, data);

                    


                })();








            })
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}


function getFormGuideHeadToHead(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.gameId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let totalCount = 0;

            let game_condition = { 
                isDeleted: false,
                _id: req.query.gameId
            }
            let sportId = "";
            let homeTeamId = "";
            let awayTeamId = "";

            let game_exist = await commonQuery.fetch_one(GAME, game_condition)
            if (game_exist) {
                sportId = game_exist.sport;
                homeTeamId = game_exist.homeTeam;
                awayTeamId = game_exist.awayTeam
            }else{
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);

            }

            let condition = { 
                isDeleted: false,
                season: "current",
                sport: sportId,
                winningTeam: {$ne: ""}
            }
            condition['$or'] = [{
                homeTeam: homeTeamId,
                awayTeam: awayTeamId
            },
            {
                awayTeam: homeTeamId,
                homeTeam: awayTeamId
            }];

            let teamResults = [];
            let team = {
                _id: "",
                teamname: "",
                teamLogo: ""
            }
            let result = {
                home: {},
                away: {},
                result: "",
                points: 0,
                round: {}
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
            }).lean().exec(function (err, gameList) {

                gameList.map(game=>{
                    if(game.homeTeam._id.equals(homeTeamId) && game.awayTeam._id.equals(awayTeamId)){
                        result.home._id = game.homeTeam._id;
                        result.home.teamname = game.homeTeam.teamname;
                        result.home.teamLogo = game.homeTeam.teamLogo;
                        result.away._id = game.awayTeam._id;
                        result.away.teamname = game.awayTeam.teamname;
                        result.away.teamLogo = game.awayTeam.teamLogo;

                        result.round = game.round;
                        result.result = game.winningTeam.toLowerCase();
                        result.points = game.points;


                        // if(game.winningTeam.toLowerCase()=="home"){
                        //     result.homeTeamResult = "W";
                        //     result.awayTeamResult = "L";
                        // }else if(game.winningTeam.toLowerCase()=="away"){
                        //     result.homeTeamResult = "L";
                        //     result.awayTeamResult = "W";
                        // }else{
                        //     result.homeTeamResult = "D";
                        //     result.awayTeamResult = "D";
                        // }
                    }else{
                        result.home._id = game.awayTeam._id;
                        result.home.teamname = game.awayTeam.teamname;
                        result.home.teamLogo = game.awayTeam.teamLogo;
                        result.away._id = game.homeTeam._id;
                        result.away.teamname = game.homeTeam.teamname;
                        result.away.teamLogo = game.homeTeam.teamLogo;

                        result.round = game.round;
                        result.result = game.winningTeam.toLowerCase();
                        result.points = game.points;
                        // if(game.winningTeam.toLowerCase()=="home"){
                        //     result.homeTeamResult = "L";
                        //     result.awayTeamResult = "W";
                        // }else if(game.winningTeam.toLowerCase()=="away"){
                        //     result.homeTeamResult = "W";
                        //     result.awayTeamResult = "L";
                        // }else{
                        //     result.homeTeamResult = "D";
                        //     result.awayTeamResult = "D";
                        // }
                    }
                    teamResults.push(result);
                });

                if(teamResults.length>0){
                    totalCount = teamResults.length;
                    let results = [];
                    results = teamResults.slice(skip,skip+count);

                    if(results.length>0){
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, results, totalCount);

                    }else{
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, results, totalCount);

                    }

                }else{
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, teamResults, totalCount);

                }






            })
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function getCompLadder(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.compId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let sortObject = { seasonPoints: -1 }
            let totalCount = 0;

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            let condition = { 
                isDeleted: false,
                isJoined: true,
                competitionId: req.query.compId
            }


            let query = JOINCOMP.find(condition);
            query.populate({
                path: 'competitionId',
                populate: [{
                    path: 'sport',
                    select: 'sportname'
                   },{
                     path: 'createdBy',
                     select: 'username'
                   }]

            }).populate({
                path: 'userId',
                select: 'username name profilePhoto'
            })
            .sort(sortObject).skip(skip).limit(count).lean().exec(function (err, userList) {
                if(err){
                    return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                }

                (async  () => {

                let users = [];
                for(let i=0; i<userList.length; i++){

                    let userData = {
                        user: {},
                        currentRoundPoints: 0.00,
                        previousRoundPoints: 0.00,
                        seasonPoints: 0.00
                    }

                    userData.user = userList[i].userId;
                    userData.currentRoundPoints = userList[i].currentRoundPoints.toFixed(2);
                    userData.previousRoundPoints = userList[i].previousRoundPoints.toFixed(2);
                    userData.seasonPoints = userList[i].seasonPoints.toFixed(2);

                    let round_condition = { 
                        isDeleted: false,
                        sport: userList[i].competitionId.sport._id
                    }
        
                    let roundList = await commonQuery.findData(ROUND, round_condition);

                    for(let j=0; j<roundList.data.length; j++){

                        if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                            let game_condition = {
                                round: roundList.data[j]._id,
                                isDeleted: false,
                                winningTeam: {$ne: ""}
                            }
                            let game_exist = await commonQuery.fetch_one(GAME, game_condition);

                            if(!game_exist){
                                userData.currentRoundPoints = parseFloat(0.00).toFixed(2);
                                userData.previousRoundPoints = userList[i].currentRoundPoints.toFixed(2);
                                userData.seasonPoints = userList[i].seasonPoints.toFixed(2);
                            }
                        }

                    }



                    // let round_condition = { 
                    //     isDeleted: false,
                    //     sport: userList[i].competitionId.sport._id
                    // }

                    // userList[i].userRoundPoints = [];
        
                    // let roundList = await commonQuery.findData(ROUND, round_condition);
                    // for(let j=0; j<roundList.data.length; j++){

                    //     let userRoundPoint = {
                    //         roundId: '',
                    //         roundNo: 0,
                    //         roundState: '',
                    //         points: 0
                    //     }

                    //     let userPoints = 0;
                    //     let winningTippingCount = 0;


                    //     let game_condition = { 
                    //         round: roundList.data[j]._id,
                    //         winningTeam: {$ne: ""},
                    //         isDeleted: false
                    //     }

                    //     let games = await commonQuery.findData(GAME, game_condition);

                    //     for(let k=0; k<games.data.length; k++){
                            
                    //         let tipping_condition = {
                    //             user: userList[i].userId._id,
                    //             game: games.data[k]._id,
                    //         }

                    //         let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    //         if(tipping){
                    //             if(tipping.bettingTeam.toLowerCase()==games.data[k].winningTeam.toLowerCase()){
                    //                 winningTippingCount++;
                    //                 let game_tipping_condition = { 
                    //                     game: games.data[k]._id,
                    //                     bettingTeam: tipping.bettingTeam
                    //                 }
                        
                    //                 let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);
                    //                 let userbonus_condition = {
                    //                     user: userList[i].userId._id,
                    //                     comp: req.query.compId,
                    //                     round: roundList.data[j]._id
                    //                 }
                    //                 let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);
                    //                 let gamePoint = 0;
                    //                 let multiplyBy = 1;
                    //                 if(games.data[k].winningTeam.toLowerCase()=="home"){
                    //                     gamePoint = games.data[k].homeTeamPoints;
                    //                     if(roundList.data[j].roundtype=="playoff"){
                    //                         multiplyBy *= 2;
                    //                     }

                    //                     if(gameWinningTippingCount==1){
                    //                         multiplyBy *= 2;
                    //                     }
                    //                     let countWinningTippingCount = 0;

                                        
                    //                     let game_condition = { 
                    //                         sport: userList[i].competitionId.sport._id,
                    //                         gameDate: {$lte: games.data[k].gameDate},
                    //                         winningTeam: {$ne: ""},
                    //                         isDeleted: false
                    //                     }
                
                    //                     let allgames = await commonQuery.findData(GAME, game_condition);
                    //                     let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                    //                     for(let l=0; l<sortedgames.length; l++){
                    //                         let tipping_condition = {
                    //                             user: userList[i].userId._id,
                    //                             game: sortedgames[l]._id
                    //                         }
                
                    //                         let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    //                         if(tipping){
                    //                             if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                    //                                 break;
                    //                             }

                    //                         }
                    //                         countWinningTippingCount++;
                    //                     }
                                        


                    //                     if(countWinningTippingCount>4){
                    //                         multiplyBy *= 2;
                    //                     }

                    //                     if(userbonus && userbonus.currentBonus==2){
                    //                         multiplyBy *= 2;
                    //                     }else if(userbonus && userbonus.currentBonus==3){
                    //                         multiplyBy *= 3;
                    //                     }else{
                    //                         multiplyBy *= 1;
                    //                     }
                    //                      userPoints += gamePoint * multiplyBy;
                    //                 }else{
                    //                     gamePoint = games.data[k].awayTeamPoints;
                    //                     if(roundList.data[j].roundtype=="playoff"){
                    //                         multiplyBy *= 2;
                    //                     }

                    //                     if(gameWinningTippingCount==1){
                    //                         multiplyBy *= 2;
                    //                     }
                    //                     let countWinningTippingCount = 0;

                                        
                    //                     let game_condition = { 
                    //                         sport: userList[i].competitionId.sport._id,
                    //                         gameDate: {$lte: games.data[k].gameDate},
                    //                         winningTeam: {$ne: ""},
                    //                         isDeleted: false
                    //                     }
                
                    //                     let allgames = await commonQuery.findData(GAME, game_condition);
                    //                     let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                    //                     for(let l=0; l<sortedgames.length; l++){
                    //                         let tipping_condition = {
                    //                             user: userList[i].userId._id,
                    //                             game: sortedgames[l]._id
                    //                         }
                
                    //                         let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    //                         if(tipping){
                    //                             if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                    //                                 break;
                    //                             }

                    //                         }
                    //                         countWinningTippingCount++;
                    //                     }
                                        


                    //                     if(countWinningTippingCount>4){
                    //                         multiplyBy *= 2;
                    //                     }

                    //                     if(userbonus && userbonus.currentBonus==2){
                    //                         multiplyBy *= 2;
                    //                     }else if(userbonus && userbonus.currentBonus==3){
                    //                         multiplyBy *= 3;
                    //                     }else{
                    //                         multiplyBy *= 1;
                    //                     }
                    //                     userPoints += gamePoint * multiplyBy;
                    //                 }


                    //             }
                    //         }

                        

                    //     }

                    //     if(winningTippingCount!==0 && winningTippingCount==games.data.length){
                    //         userPoints = userPoints + userList[i].competitionId.bonuspoint;
                    //     }

                    //     if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                    //         userRoundPoint.roundState = "past";
                    //         userRoundPoint.roundId = roundList.data[j]._id;
                    //         userRoundPoint.roundNo = roundList.data[j].roundno;
                    //         userRoundPoint.points = userPoints.toFixed(2);
                    //         userData.seasonPoints = (parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    //     }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                    //         userRoundPoint.roundId = roundList.data[j]._id;
                    //         userRoundPoint.roundNo = roundList.data[j].roundno;
                    //         userRoundPoint.points = userPoints;
                    //         userRoundPoint.roundState = "present";
                    //         userData.currentRoundPoints = userPoints.toFixed(2);
                    //         userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                    //         if(userRoundPoint.roundNo>1){
                    //             let previousRound = userList[i].userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                    //             userData.previousRoundPoints = parseFloat(previousRound.points).toFixed(2);
                    //         }else{
                    //             userData.previousRoundPoints = parseFloat(userData.previousRoundPoints).toFixed(2);

                    //         }
                    //     }else{
                    //         userRoundPoint.roundState = "future";
                    //         userRoundPoint.roundId = roundList.data[j]._id;
                    //         userRoundPoint.roundNo = roundList.data[j].roundno;
                    //         userRoundPoint.points = userPoints.toFixed(2);
                    //     }

                    //     userList[i].userRoundPoints.push(userRoundPoint);
                    // }



                    users.push(userData);
                }



                if(users.length>0){
                    if(users.length>1){
                        users.sort((a, b) => b.seasonPoints - a.seasonPoints);
                    }
                    let results = [];
                    results = users.slice(skip,skip+count);
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, results, users.length);

                }else{
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, users, users.length);

                }





            })();

                



        })

        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}


function getNewHome2(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            if(req.query.compId){
                let condition = { 
                    isDeleted: false,
                    isJoined: true,
                    competitionId: req.query.compId
                }
    
    
                let query = JOINCOMP.find(condition);
                query.populate({
                    path: 'competitionId',
                    populate: [{
                        path: 'sport',
                        select: 'sportname'
                       },{
                         path: 'createdBy',
                         select: 'username'
                       }]
    
                }).populate({
                    path: 'userId',
                    select: 'username profilePhoto'
                })
                .lean().exec(function (err, userList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }
    
                    (async  () => {
    
                    let users = [];
                    let heaterBonus = 0;
                    for(let i=0; i<userList.length; i++){
    
                        let userData = {
                            user: {},
                            currentRound: {},
                            previousRound: {},
                            seasonPoints: 0.00,
                            position: 0,
                            heaterBonus: 0
                        }
    
    
                        userData.user = userList[i].userId;
    
    
    
                        let round_condition = { 
                            isDeleted: false,
                            sport: userList[i].competitionId.sport._id
                        }
    
                        userList[i].userRoundPoints = [];
            
                        let roundList = await commonQuery.findData(ROUND, round_condition);
                        for(let j=0; j<roundList.data.length; j++){
    
                            let userRoundPoint = {
                                roundId: '',
                                roundNo: 0,
                                roundState: '',
                                points: 0
                            }
    
                            let userPoints = 0;
                            let winningTippingCount = 0;
    
    
                            let game_condition = { 
                                isDeleted: false,
                                winningTeam: {$ne: ""},
                                round: roundList.data[j]._id
                            }
    
                            let games = await commonQuery.findData(GAME, game_condition);
    
                            for(let k=0; k<games.data.length; k++){
                                
                                let tipping_condition = {
                                    user: userList[i].userId,
                                    game: games.data[k]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()==games.data[k].winningTeam.toLowerCase()){
                                        winningTippingCount++;
                                        let game_tipping_condition = { 
                                            game: games.data[k]._id,
                                            bettingTeam: tipping.bettingTeam
                                        }
                            
                                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);
                                        let userbonus_condition = {
                                            user: userList[i].userId,
                                            comp: req.query.compId,
                                            round: roundList.data[j]._id
                                        }
                                        let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);
                                        let gamePoint = 0;
                                        let multiplyBy = 1;
                                        if(games.data[k].winningTeam.toLowerCase()=="home"){
                                            gamePoint = games.data[k].homeTeamPoints;
                                            if(roundList.data[j].roundtype=="playoff"){
                                                multiplyBy *= 2;
                                            }
    
                                            if(gameWinningTippingCount==1){
                                                multiplyBy *= 2;
                                            }
                                            let countWinningTippingCount = 0;

                                            
                                            let game_condition = { 
                                                sport: userList[i].competitionId.sport._id,
                                                gameDate: {$lte: games.data[k].gameDate},
                                                winningTeam: {$ne: ""},
                                                isDeleted: false
                                            }
                    
                                            let allgames = await commonQuery.findData(GAME, game_condition);
                                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                                            for(let l=0; l<sortedgames.length; l++){
                                                let tipping_condition = {
                                                    user: userList[i].userId._id,
                                                    game: sortedgames[l]._id
                                                }
                    
                                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                                if(tipping){
                                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                                        break;
                                                    }
    
                                                }
                                                countWinningTippingCount++;
                                            }
                                            
    
    
                                            if(countWinningTippingCount>4){
                                                multiplyBy *= 2;
                                            }
    
                                            if(userbonus && userbonus.currentBonus==2){
                                                multiplyBy *= userbonus.currentBonus;
                                            }else if(userbonus && userbonus.currentBonus==3){
                                                multiplyBy *= userbonus.currentBonus;
                                            }else{
                                                multiplyBy *= 1;
                                            }
                                            userPoints += gamePoint * multiplyBy;
                                        }else{
                                            gamePoint = games.data[k].awayTeamPoints;
                                            if(roundList.data[j].roundtype=="playoff"){
                                                multiplyBy *= 2;
                                            }
    
                                            if(gameWinningTippingCount==1){
                                                multiplyBy *= 2;
                                            }
                                            let countWinningTippingCount = 0;

                                            
                                            let game_condition = { 
                                                sport: userList[i].competitionId.sport._id,
                                                gameDate: {$lte: games.data[k].gameDate},
                                                winningTeam: {$ne: ""},
                                                isDeleted: false
                                            }
                    
                                            let allgames = await commonQuery.findData(GAME, game_condition);
                                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                                            for(let l=0; l<sortedgames.length; l++){
                                                let tipping_condition = {
                                                    user: userList[i].userId._id,
                                                    game: sortedgames[l]._id
                                                }
                    
                                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                                if(tipping){
                                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                                        break;
                                                    }
    
                                                }
                                                countWinningTippingCount++;
                                            }
                                            
    
    
                                            if(countWinningTippingCount>4){
                                                multiplyBy *= 2;
                                            }
    
                                            if(userbonus && userbonus.currentBonus==2){
                                                multiplyBy *= 2;
                                            }else if(userbonus && userbonus.currentBonus==3){
                                                multiplyBy *= 3;
                                            }else{
                                                multiplyBy *= 1;
                                            }
                                            userPoints += gamePoint * multiplyBy;
                                        }
    
    
                                    }
                                }
    
                            
    
                            }
    
                            if(winningTippingCount!==0 && winningTippingCount==games.data.length){
                                userPoints = userPoints + userList[i].competitionId.bonuspoint;
                            }
    
                            if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                                userRoundPoint.roundState = "past";
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                                userRoundPoint.points = userPoints.toFixed(2);
                                userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
    
    
                            }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                                userRoundPoint.points = userPoints.toFixed(2);
                                userRoundPoint.roundState = "present";
                                userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                                roundList.data[j].points = userPoints;
                                userData.currentRound = userRoundPoint;
                                 if(userRoundPoint.roundNo>1){
                                    let previousRound = userList[i].userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                                    userData.previousRound = previousRound;
                                    userData.previousRound.points = parseFloat(userData.previousRound.points).toFixed(2);
                                }

                                let game_condition = { 
                                    sport: userList[i].competitionId.sport._id,
                                    winningTeam: {$ne: ""},
                                    isDeleted: false
                                }

                                heaterBonus = 0;
        
                                let allgames = await commonQuery.findData(GAME, game_condition);
                                let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                                for(let l=0; l<sortedgames.length; l++){
                                    let tipping_condition = {
                                        user: userList[i].userId._id,
                                        game: sortedgames[l]._id
                                    }
        
                                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                    if(tipping){
                                        if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                            break;
                                        }

                                    }
                                    heaterBonus++;
                                }

                                userData.heaterBonus = heaterBonus;
    
                            }else{
                                userRoundPoint.roundState = "future";
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                                userRoundPoint.points = userPoints;
                            }
    
                            userList[i].userRoundPoints.push(userRoundPoint);
                        }
    
    
    
                        users.push(userData);
                    }
    
    
    
                    if(users.length>0){
                        if(users.length>1){
                            users.sort((a, b) => b.seasonPoints - a.seasonPoints);
                        }
                        let userIndex = users.findIndex(user=>user.user._id==req.query.userId)
                        if(userIndex>=0){
                            users[userIndex].position = userIndex+1;
                            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, users[userIndex]);
                        }else{
                            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, {});
                        }
    
                    }else{
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_NOT_FOUND, {});
    
                    }
    
    
    
    
    
                })();
    
            })
            }else{

                let user_condition = { 
                    isDeleted: false,
                    _id: req.query.userId
                }
    
                let user = await commonQuery.fetch_one(USER, user_condition);

                let userData = {
                    user: {},
                    currentRound: {},
                    previousRound: {},
                    seasonPoints: 0.00,
                    position: 0,
                    heaterBonus: 0
                }

                let userInfo = {
                    _id: user._id,
                    username: user.username,
                    profilePhoto: user.profilePhoto
                }

                userData.user = userInfo;

                let round_condition = { 
                    isDeleted: false,
                    sport: req.query.sportId
                }

                let userRoundPoints = [];

    
                let roundList = await commonQuery.findData(ROUND, round_condition);
                for(let j=0; j<roundList.data.length; j++){

                    let userRoundPoint = {
                        roundId: '',
                        roundNo: 0,
                        roundState: '',
                        points: 0
                    }

                    let userPoints = 0;
                    let heaterBonus = 0;


                    let game_condition = { 
                        isDeleted: false,
                        winningTeam: {$ne: ""},
                        round: roundList.data[j]._id
                    }

                    let games = await commonQuery.findData(GAME, game_condition);

                    if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                        userRoundPoint.roundState = "past";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userRoundPoint.roundState = "present";
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                        roundList.data[j].points = userPoints;
                        userData.currentRound = userRoundPoint;
                        if(userRoundPoint.roundNo>1){
                            let previousRound = userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                            userData.previousRound = previousRound;
                            userData.previousRound.points = parseFloat(userData.previousRound.points).toFixed(2);
                        }
                        heaterBonus = 0;
                        if(games.data.length>=1){
                            for(let l=games.data.length-1; l>=0; l--){
                                let tipping_condition = {
                                    user: req.query.userId,
                                    game: games.data[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==games.data[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                heaterBonus++;
                            }
                        }

                        userData.heaterBonus = heaterBonus;

                    }else{
                        userRoundPoint.roundState = "future";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints;
                    }

                    userRoundPoints.push(userRoundPoint);

                }

                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, userData);


            }



        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function getNewHome(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            if(req.query.compId){
                let condition = { 
                    isDeleted: false,
                    isJoined: true,
                    competitionId: req.query.compId
                }

                let sortObject = { seasonPoints: -1 }

    
    
                let query = JOINCOMP.find(condition);
                query.populate({
                    path: 'competitionId',
                    populate: [{
                        path: 'sport',
                        select: 'sportname'
                       },{
                         path: 'createdBy',
                         select: 'username'
                       }]
    
                }).populate({
                    path: 'userId',
                    select: 'username profilePhoto'
                })
                .sort(sortObject).lean().exec(function (err, userList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }
    
                    (async  () => {
    
                    let userIndex = userList.findIndex(u=>u.userId._id==req.query.userId);
                    let user = userList[userIndex];
                    user.position = userIndex+1;
                    // for(let i=0; i<userList.length; i++){
    
                        let userData = {
                            user: {},
                            currentRound: {},
                            previousRound: {},
                            seasonPoints: 0.00,
                            position: 0,
                            heaterBonus: 0
                        }
    
    
                        userData.user = user.userId;
                        userData.position = user.position;
    
    
    
                        let round_condition = { 
                            isDeleted: false,
                            sport: user.competitionId.sport._id
                        }
    
                        user.userRoundPoints = [];
            
                        let roundList = await commonQuery.findData(ROUND, round_condition);
                        for(let j=0; j<roundList.data.length; j++){
    
                            let userRoundPoint = {
                                roundId: '',
                                roundNo: 0,
                                roundState: '',
                                points: 0
                            }
    
    
                            if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                                userRoundPoint.roundState = "past";
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                                userRoundPoint.points = user.previousRoundPoints.toFixed(2);
                                userData.seasonPoints = user.seasonPoints.toFixed(2);
    
    
                            }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                                userRoundPoint.points = user.currentRoundPoints.toFixed(2);
                                userRoundPoint.roundState = "present";
                                userData.seasonPoints = user.seasonPoints.toFixed(2);
                                userData.currentRound = userRoundPoint;
                                 if(userRoundPoint.roundNo>1){
                                    let previousRound = user.userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                                    userData.previousRound = previousRound;

                                    let game_condition = {
                                        round: roundList.data[j]._id,
                                        isDeleted: false,
                                        winningTeam: {$ne: ""}
                                    }
                                    let game_exist = await commonQuery.fetch_one(GAME, game_condition);
        
                                    if(!game_exist){
                                        console.log("game_no_exist", game_exist);
                                        userData.currentRound.points = parseFloat(0.00).toFixed(2);
                                        userData.previousRound.points = user.currentRoundPoints.toFixed(2);
                                        userData.seasonPoints = user.seasonPoints.toFixed(2);
                                    }
                                }

                                userData.heaterBonus = user.heaterBonus;

            

                                    
            
                                
    
                            }else{
                                userRoundPoint.roundState = "future";
                                userRoundPoint.roundId = roundList.data[j]._id;
                                userRoundPoint.roundNo = roundList.data[j].roundno;
                                userRoundPoint.roundName = roundList.data[j].roundname;
                            }
    
                            user.userRoundPoints.push(userRoundPoint);
                        }
    

                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, userData);

    
    
    
    
    
                })();
    
            })
            }else{

                let user_condition = { 
                    isDeleted: false,
                    _id: req.query.userId
                }
    
                let user = await commonQuery.fetch_one(USER, user_condition);

                let userData = {
                    user: {},
                    currentRound: {},
                    previousRound: {},
                    seasonPoints: 0.00,
                    position: 0,
                    heaterBonus: 0
                }

                let userInfo = {
                    _id: user._id,
                    username: user.username,
                    profilePhoto: user.profilePhoto
                }

                userData.user = userInfo;

                let round_condition = { 
                    isDeleted: false,
                    sport: req.query.sportId
                }

                let userRoundPoints = [];

    
                let roundList = await commonQuery.findData(ROUND, round_condition);
                for(let j=0; j<roundList.data.length; j++){

                    let userRoundPoint = {
                        roundId: '',
                        roundNo: 0,
                        roundState: '',
                        points: 0
                    }

                    let userPoints = 0;
                    let heaterBonus = 0;


                    let game_condition = { 
                        isDeleted: false,
                        winningTeam: {$ne: ""},
                        round: roundList.data[j]._id
                    }

                    let games = await commonQuery.findData(GAME, game_condition);

                    if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                        userRoundPoint.roundState = "past";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userRoundPoint.roundState = "present";
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                        roundList.data[j].points = userPoints;
                        userData.currentRound = userRoundPoint;
                        if(userRoundPoint.roundNo>1){
                            let previousRound = userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                            userData.previousRound = previousRound;
                            userData.previousRound.points = parseFloat(userData.previousRound.points).toFixed(2);
                        }
                        heaterBonus = 0;
                        if(games.data.length>=1){
                            for(let l=games.data.length-1; l>=0; l--){
                                let tipping_condition = {
                                    user: req.query.userId,
                                    game: games.data[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==games.data[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                heaterBonus++;
                            }
                        }

                        userData.heaterBonus = heaterBonus;

                    }else{
                        userRoundPoint.roundState = "future";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.roundName = roundList.data[j].roundname;
                        userRoundPoint.points = userPoints;
                    }

                    userRoundPoints.push(userRoundPoint);

                }

                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, userData);


            }



        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function getHeaterBonus(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.userId) || !mongoose.Types.ObjectId.isValid(req.query.roundId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let game_condition = { 
                isDeleted: false,
                winningTeam: {$ne: ""},
                round: req.query.roundId
            }

            let games = await commonQuery.findData(GAME, game_condition);
            let heaterBonus = 0;
            let data = {
                heaterBonus: heaterBonus
            }
            if(games.data.length>=1){
                for(let l=games.data.length-1; l>=0; l--){
                    let tipping_condition = {
                        user: req.query.userId,
                        game: games.data[l]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase()!==games.data[l].winningTeam.toLowerCase()){
                            break;
                        }

                    }
                    heaterBonus++;
                }

                data.heaterBonus = heaterBonus;
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, data);

            }else{
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, data);

            }





        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}



function getLiveGames(req, res) {
    async function asy_init() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.query.roundId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;
            let round_condition = { 
                _id: req.query.roundId 
            }

            let round = await commonQuery.fetch_one(ROUND, round_condition);

            let role_condition = { 
                rolename: 'admin'
            }

            let role = await commonQuery.fetch_one(ROLE, role_condition);

            let game_condition = {
                round: req.query.roundId,
                isDeleted: false
            }

            let sortObject = { gameDate: 1 } //1 asc -1 desc

            let join_comp_condition = { 
                isDeleted: false,
                isJoined: true,
                competitionId: req.query.compId 
            }

            let totalCount = await commonQuery.countData(JOINCOMP, join_comp_condition);
            let game = GAME.find(game_condition);
            game.populate({
                path: 'homeTeam',
                select: 'teamname teamLogo',
            }).populate({
                path: 'awayTeam',
                select: 'teamname teamLogo',
            }).sort(sortObject).lean().exec(function (err, gameList) {

                let condition = { 
                    isDeleted: false,
                    isJoined: true,
                    competitionId: req.query.compId
                }
    
    
                let query = JOINCOMP.find(condition);
                query.populate({
                    path: 'competitionId',
                    populate: [{
                        path: 'sport',
                        select: 'sportname'
                       },{
                         path: 'createdBy',
                         select: 'username'
                       }]
    
                }).populate({
                    path: 'userId',
                    select: 'username name profilePhoto'
                })
                .skip(skip).limit(count).lean().exec(function (err, userList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }

    
                    (async  () => {

                        var users = [];

    
                    for(let i=0; i<userList.length; i++){

                        let user = {
                            _id: null,
                            username: null,
                            name: null,
                            profilePhoto: null,
                            games: []
                        }

                        var games = [];
                        
    
                        // let game_condition = {
                        //     round: req.query.roundId
                        // }
    
                        //let games = await commonQuery.findData(GAME, game_condition);
    
                        for(let j=0; j<gameList.length; j++){

                            let game = {
                                _id: gameList[j]._id,
                                homeTeamPoints: gameList[j].homeTeamPoints,
                                awayTeamPoints: gameList[j].awayTeamPoints,
                                homeSeasonPoints: gameList[j].homeSeasonPoints,
                                awaySeasonPoints: gameList[j].awaySeasonPoints,
                                points: gameList[j].points,
                                gameDate: gameList[j].gameDate,
                                gameTime: gameList[j].gameTime,
                                gameState: gameList[j].gameState,
                                homeTeam: gameList[j].homeTeam,
                                awayTeam: gameList[j].awayTeam,
                                winningTeam: gameList[j].winningTeam,
                                tipping: null
                              }


                            gameList[j].winningTeam = gameList[j].winningTeam.toLowerCase();
        
                            let tipping_condition = {
                                user: userList[i].userId._id,
                                game: gameList[j]._id
                            }
        
                            let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                            if(tipping){
                                game.tipping = tipping.bettingTeam.toLowerCase();
                            }else{
                                game.tipping = "";
                            }

                            games.push(game);
       
                        }

                        userList[i].userId.games = gameList;
                        user._id = userList[i].userId._id;
                        user.username = userList[i].userId.username;
                        user.name = userList[i].userId.name;
                        user.profilePhoto = userList[i].userId.profilePhoto;
                        user.games = games;

                        users.push(user);

                        
                    }
    
                    
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, users, totalCount);
                })();
    
            })

            })



        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}


function updateUserCompPoints(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            //For Calculate Heater Bonus
            let getCalculatedHeaterBonus = async function getCalculatedHeaterBonus(games, userList){

                let heaterBonus = 0;

                for(let l=0; l<games.length; l++){
                    let tipping_condition = {
                        user: userList.userId,
                        game: games[l]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase() !== games[l].winningTeam.toLowerCase()){
                            break;
                        }

                    }
                    heaterBonus++;
                }

                return heaterBonus;

            }

            //For Calculate Game Points
            let getCalculatedGamePoints = async function getCalculatedGamePoints(gameData, compUserData, roundData, userbonus, compNo, totalComp){

                // console.log("STARTCALCULATION COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);


                let winningTippingCount = 0;
                let userPoints = 0;

                let tipping_condition = {
                    user: compUserData.userId,
                    game: gameData._id,
                }

                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                if(tipping){
                    if(tipping.bettingTeam.toLowerCase() == gameData.winningTeam.toLowerCase()){
                        winningTippingCount++;
                        let game_tipping_condition = { 
                            game: gameData._id,
                            bettingTeam: tipping.bettingTeam
                        }
            
                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);

                        let gamePoint = 0;
                        let multiplyBy = 1;
                        if(gameData.winningTeam.toLowerCase()=="home"){
                            gamePoint = gameData.homeTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            //let allgames = await commonQuery.findData(GAME, game_condition);
                            //let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                             userPoints += gamePoint * multiplyBy;
                        }else{
                            gamePoint = gameData.awayTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            //let allgames = await commonQuery.findData(GAME, game_condition);
                            //let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1}, 5);
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                            userPoints += gamePoint * multiplyBy;
                        }


                    }
                }

                return {
                    winningTippingCount: winningTippingCount,
                    userPoints: userPoints
                }

            }

            let updateUserdata = async function updateUserdata(userList, compList, roundList, compNo, totalComp){

                // console.log("STARTUPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);


                let userData = {
                    user: {},
                    currentRoundPoints: 0.00,
                    previousRoundPoints: 0.00,
                    seasonPoints: 0.00,
                    heaterBonus: 0
                }

                userData.user = userList.userId;
                userList.userRoundPoints = [];

                //calculate round points
                for(let j=0; j<roundList.data.length; j++){

                    let userbonus_condition = {
                        user: userList.userId,
                        comp: userList.competitionId,
                        round: roundList.data[j]._id
                    }
                    let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);

                    let userRoundPoint = {
                        roundId: '',
                        roundNo: 0,
                        roundState: '',
                        points: 0
                    }

                    let userPoints = 0;
                    let winningTippingCount = 0;


                    let game_condition = { 
                        round: roundList.data[j]._id,
                        winningTeam: {$ne: ""},
                        isDeleted: false
                    }

                    let games = await commonQuery.findData(GAME, game_condition);

                    for(let k=0; k<games.data.length; k++){

                        let calculatedPoints = await getCalculatedGamePoints(games.data[k], userList, roundList.data[j], userbonus, compNo, totalComp);
                        console.log("CALCULATEDPOINTS: ", calculatedPoints);

                        userPoints = userPoints + calculatedPoints.userPoints;
                        winningTippingCount = winningTippingCount + calculatedPoints.winningTippingCount;

                    }

                    if(winningTippingCount!==0 && winningTippingCount==games.data.length){
                        userPoints = userPoints + compList.bonuspoint;
                    }

                    if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                        userRoundPoint.roundState = "past";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userData.seasonPoints = (parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints;
                        userRoundPoint.roundState = "present";
                        userData.currentRoundPoints = userPoints.toFixed(2);
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                        if(userRoundPoint.roundNo>1){
                            let previousRound = userList.userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                            userData.previousRoundPoints = parseFloat(previousRound.points).toFixed(2);
                        }else{
                            userData.previousRoundPoints = parseFloat(userData.previousRoundPoints).toFixed(2);

                        }

                        let game_condition = { 
                            sport: req.query.sportId,
                            winningTeam: {$ne: ""},
                            isDeleted: false
                        }

                        let heaterBonus = 0;

                        //let allgames = await commonQuery.findData(GAME, game_condition);
                        //let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                        let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                        heaterBonus = await getCalculatedHeaterBonus(sortedgames, userList);

                        userData.heaterBonus = heaterBonus;
                    }else{
                        userRoundPoint.roundState = "future";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                    }

                    userList.userRoundPoints.push(userRoundPoint);
                }


                let obj_update = {
                    seasonPoints: parseFloat(userData.seasonPoints),
                    currentRoundPoints: parseFloat(userData.currentRoundPoints),
                    previousRoundPoints: parseFloat(userData.previousRoundPoints),
                    heaterBonus: parseInt(userData.heaterBonus)
                }
                let updateCondition = {
                    _id: userList._id
                };
                let update_join_comp = await commonQuery.updateOneDocument(JOINCOMP, updateCondition, obj_update);
                console.log("UPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);
                console.log("END TIME: ", new Date())

            }

            let round_condition = { 
                isDeleted: false,
                sport: req.query.sportId
            }

            let roundList = await commonQuery.findData(ROUND, round_condition);

            // let comp_condition = {
            //     isDeleted: false,
            //     sport: req.query.sportId
            // }

            // let compList = await commonQuery.findData(COMP, comp_condition);

            // if(compList.data.length>0){
            //     for(let m=0; m<compList.data.length; m++){

            //         let condition = { 
            //             isDeleted: false,
            //             competitionId: compList.data[m]._id
            //         }

            //             let userList = await commonQuery.findData(JOINCOMP, condition);
        
            //             for(let i=0; i<userList.data.length; i++){

            //                 updateUserdata(userList.data[i], compList.data[m], roundList, m+1, compList.data.length);

            //             }        
        

            //     }
                
            //      return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS);

            // }else{
            //     return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS);

            // }

            let joincomp_condition = { 
                isDeleted: false,
                isJoined: true,
            }


            let query = JOINCOMP.find(joincomp_condition);
            query.populate({
                path: 'competitionId',
                match: { sport: req.query.sportId},
                select: 'sport competitionname bonuspoint bonus2xpoint bonus3xpoint'
            }).lean().exec(function (err, userList) {
                if(userList){
                    console.log("USERLIST: ", userList[0])
                    console.log("USERLISTLENGTH: ", userList.length)
                    console.log("START TIME: ", new Date())
                    // let i = 0;
                    // updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);


                    for(let i=0; i<userList.length; i++){
                        

                        updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);

                    }
                }
            });

        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}


function updateUserCompGamePoints(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.sportId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            let updateUserdata = async function calculatePoints(userList, compList, currentRound, currentRoundGames, isFirstGame){
                let userData = {
                    user: {},
                    currentRoundPoints: 0.00,
                    previousRoundPoints: 0.00,
                    seasonPoints: 0.00,
                    heaterBonus: 0
                }

                userData.user = userList.userId;

                let userPoints = 0;
                let winningTippingCount = 0;

                for(let i=0; i<currentRoundGames.data.length; i++){
                    let tipping_condition = {
                        user: userList.userId,
                        game: currentRoundGames.data[i]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase()==currentRoundGames.data[i].winningTeam.toLowerCase()){
                            winningTippingCount++;
                        }

                    }
                }

                let game_condition = { 
                    _id: req.query.gameId,
                    isDeleted: false
                }

                let game = await commonQuery.fetch_one(GAME, game_condition);
                        
                let tipping_condition = {
                    user: userList.userId,
                    game: req.query.gameId

                }

                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                if(tipping){
                    if(tipping.bettingTeam.toLowerCase()==game.winningTeam.toLowerCase()){
                        let game_tipping_condition = { 
                            game: game._id,
                            bettingTeam: tipping.bettingTeam
                        }
            
                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);
                        let userbonus_condition = {
                            user: userList.userId,
                            comp: userList.competitionId,
                            round: currentRound._id
                        }
                        let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);
                        let gamePoint = 0;
                        let multiplyBy = 1;
                        if(game.winningTeam.toLowerCase()=="home"){
                            gamePoint = game.homeTeamPoints;
                            if(currentRound.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: game.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            // let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1}, 5);
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: userList.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                                userPoints += gamePoint * multiplyBy;
                        }else{
                            gamePoint = game.awayTeamPoints;
                            if(currentRound.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: game.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            // let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1}, 5);
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: userList.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }

                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                            userPoints += gamePoint * multiplyBy;
                        }


                    }
                }

                if(winningTippingCount!==0 && winningTippingCount==currentRoundGames.data.length){
                    userPoints = userPoints + compList.bonuspoint;
                }

                userData.currentRoundPoints = userPoints;
                

                let all_games_condition = { 
                    sport: req.query.sportId,
                    winningTeam: {$ne: ""},
                    isDeleted: false
                }

                let heaterBonus = 0;

                let allgames = await commonQuery.findData(GAME, all_games_condition);
                let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                // let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                for(let l=0; l<sortedgames.length; l++){
                    let tipping_condition = {
                        user: userList.userId,
                        game: sortedgames[l]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                            break;
                        }

                    }
                    heaterBonus++;
                }

                userData.heaterBonus = heaterBonus;
                

                let obj_update = {
                    seasonPoints: 0,
                    currentRoundPoints: 0,
                    previousRoundPoints: 0,
                    heaterBonus: 0
                }
                 if(isFirstGame){
                    obj_update.seasonPoints = userData.currentRoundPoints + userList.seasonPoints;
                    obj_update.currentRoundPoints = userData.currentRoundPoints;
                    obj_update.previousRoundPoints = userList.currentRoundPoints;
                    obj_update.heaterBonus = userData.heaterBonus;
                }else{
                    obj_update.seasonPoints = userData.currentRoundPoints + userList.seasonPoints;
                    obj_update.currentRoundPoints = userData.currentRoundPoints + userList.currentRoundPoints;
                    obj_update.previousRoundPoints = userList.previousRoundPoints;
                    obj_update.heaterBonus = userData.heaterBonus; 
                }
                let updateCondition = {
                    _id: userList._id
                };
                console.log("userData.currentRoundPoints: ", obj_update.currentRoundPoints);
                let update_join_comp = await commonQuery.updateOneDocument(JOINCOMP, updateCondition, obj_update);

            }

            let round_condition = { 
                isDeleted: false,
                sport: req.query.sportId
            }

            let roundList = await commonQuery.findData(ROUND, round_condition);
            let currentRound;
            let isFirstGame = false;

            for(let j=0; j<roundList.data.length; j++){
                if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                    currentRound = roundList.data[j];
                }
            }

            let game_check_condition = { 
                round: currentRound._id,
                gameState: "finished", 
                isDeleted: false
            }

            let totalGameCount = await commonQuery.countData(GAME, game_check_condition);
            if(totalGameCount<=1){
                isFirstGame = true;
            }

            let round_game_condition = { 
                round: currentRound._id,
                isDeleted: false
            }

            let currentRoundGames = await commonQuery.findData(GAME, round_game_condition);

            let comp_condition = {
                isDeleted: false,
                sport: req.query.sportId
            }

            let compList = await commonQuery.findData(COMP, comp_condition);

            if(compList.data.length>0){
                console.log("Total Competition: ", compList.data.length);
                let totalCompUsers = 0;
                for(let m=0; m<compList.data.length; m++){

                    let condition = { 
                        isDeleted: false,
                        competitionId: compList.data[m]._id
                    }

                        let userList = await commonQuery.findData(JOINCOMP, condition);        
                        let users = [];
                        totalCompUsers += userList.data.length;
                        for(let i=0; i<userList.data.length; i++){

                            updateUserdata(userList.data[i], compList.data[m], currentRound, currentRoundGames, isFirstGame);
        
                        }        
        

                }
                console.log("Total Comp Users: ", totalCompUsers);
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS);

            }else{
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS);

            }

        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function resetCompUserGamePoints(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.query.sportId) || !mongoose.Types.ObjectId.isValid(req.query.compId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            //For Calculate Heater Bonus
            let getCalculatedHeaterBonus = async function getCalculatedHeaterBonus(games, userList){

                let heaterBonus = 0;

                for(let l=0; l<games.length; l++){
                    let tipping_condition = {
                        user: userList.userId,
                        game: games[l]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase() !== games[l].winningTeam.toLowerCase()){
                            break;
                        }

                    }
                    heaterBonus++;
                }

                return heaterBonus;

            }

            //For Calculate Game Points
            let getCalculatedGamePoints = async function getCalculatedGamePoints(gameData, compUserData, roundData, userbonus, compNo, totalComp){

                let winningTippingCount = 0;
                let userPoints = 0;

                let tipping_condition = {
                    user: compUserData.userId,
                    game: gameData._id,
                }

                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                if(tipping){
                    if(tipping.bettingTeam.toLowerCase() == gameData.winningTeam.toLowerCase()){
                        winningTippingCount++;
                        let game_tipping_condition = { 
                            game: gameData._id,
                            bettingTeam: tipping.bettingTeam
                        }
            
                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);

                        let gamePoint = 0;
                        let multiplyBy = 1;
                        if(gameData.winningTeam.toLowerCase()=="home"){
                            gamePoint = gameData.homeTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                             userPoints += gamePoint * multiplyBy;
                        }else{
                            gamePoint = gameData.awayTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1}, 5);
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                            userPoints += gamePoint * multiplyBy;
                        }


                    }
                }

                return {
                    winningTippingCount: winningTippingCount,
                    userPoints: userPoints
                }

            }

            let updateUserdata = async function updateUserdata(userList, compList, roundList, compNo, totalComp){

                // console.log("STARTUPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);


                let userData = {
                    user: {},
                    currentRoundPoints: 0.00,
                    previousRoundPoints: 0.00,
                    seasonPoints: 0.00,
                    heaterBonus: 0
                }

                userData.user = userList.userId;
                userList.userRoundPoints = [];

                //calculate round points
                for(let j=0; j<roundList.data.length; j++){

                    let userbonus_condition = {
                        user: userList.userId,
                        comp: userList.competitionId,
                        round: roundList.data[j]._id
                    }
                    let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);

                    let userRoundPoint = {
                        roundId: '',
                        roundNo: 0,
                        roundState: '',
                        points: 0
                    }

                    let userPoints = 0;
                    let winningTippingCount = 0;


                    let game_condition = { 
                        round: roundList.data[j]._id,
                        winningTeam: {$ne: ""},
                        isDeleted: false
                    }

                    let games = await commonQuery.findData(GAME, game_condition);

                    for(let k=0; k<games.data.length; k++){

                        let calculatedPoints = await getCalculatedGamePoints(games.data[k], userList, roundList.data[j], userbonus, compNo, totalComp);
                        console.log("CALCULATEDPOINTS: ", calculatedPoints);

                        userPoints = userPoints + calculatedPoints.userPoints;
                        winningTippingCount = winningTippingCount + calculatedPoints.winningTippingCount;

                    }

                    if(winningTippingCount!==0 && winningTippingCount==games.data.length){
                        userPoints = userPoints + compList.bonuspoint;
                    }

                    if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                        userRoundPoint.roundState = "past";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userData.seasonPoints = (parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints;
                        userRoundPoint.roundState = "present";
                        userData.currentRoundPoints = userPoints.toFixed(2);
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                        if(userRoundPoint.roundNo>1){
                            let previousRound = userList.userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                            userData.previousRoundPoints = parseFloat(previousRound.points).toFixed(2);
                        }else{
                            userData.previousRoundPoints = parseFloat(userData.previousRoundPoints).toFixed(2);

                        }

                        let game_condition = { 
                            sport: req.query.sportId,
                            winningTeam: {$ne: ""},
                            isDeleted: false
                        }

                        let heaterBonus = 0;

                        let allgames = await commonQuery.findData(GAME, game_condition);
                        let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                        //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                        heaterBonus = await getCalculatedHeaterBonus(sortedgames, userList);

                        userData.heaterBonus = heaterBonus;
                    }else{
                        userRoundPoint.roundState = "future";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                    }

                    userList.userRoundPoints.push(userRoundPoint);
                }


                let obj_update = {
                    seasonPoints: parseFloat(userData.seasonPoints),
                    currentRoundPoints: parseFloat(userData.currentRoundPoints),
                    previousRoundPoints: parseFloat(userData.previousRoundPoints),
                    heaterBonus: parseInt(userData.heaterBonus)
                }
                let updateCondition = {
                    _id: userList._id
                };
                let update_join_comp = await commonQuery.updateOneDocument(JOINCOMP, updateCondition, obj_update);
                console.log("UPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);
                console.log("END TIME: ", new Date())

            }

            let round_condition = { 
                isDeleted: false,
                sport: req.query.sportId
            }

            let roundList = await commonQuery.findData(ROUND, round_condition);

            let joincomp_condition = { 
                isDeleted: false,
                isJoined: true,
                competitionId: req.query.compId
            }


            let query = JOINCOMP.find(joincomp_condition);
            query.populate({
                path: 'competitionId',
                select: 'sport competitionname bonuspoint bonus2xpoint bonus3xpoint'
            }).lean().exec(function (err, userList) {
                if(userList){
                    console.log("USERLIST: ", userList[0])
                    console.log("USERLISTLENGTH: ", userList.length)
                    console.log("START TIME: ", new Date())
                    // let i = 0;
                    // updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);


                    for(let i=0; i<userList.length; i++){
                        

                        updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);

                    }
                }
            });

        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function resetAllCompUserGamePoints(req, res) {
    async function asy_init() {
        try {

            let currentDate = new Date();

            let isDateBetween = function isDateBetween(startDate, endDate, currentDate){
                var from = new Date(startDate);  // -1 because months are from 0 to 11
                from.setHours( 0,0,0,0 );
                var to   = new Date(endDate);
                to.setHours( 23,55,0,0 );
                //var check = new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
                var check = new Date(currentDate);
            
                if(check>to){
                    return 0;
                }else if(check<from){
                    return 2
                }else{
                    return 1;
                }
            
            }

            //For Calculate Heater Bonus
            let getCalculatedHeaterBonus = async function getCalculatedHeaterBonus(games, userList){

                let heaterBonus = 0;

                for(let l=0; l<games.length; l++){
                    let tipping_condition = {
                        user: userList.userId,
                        game: games[l]._id
                    }

                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                    if(tipping){
                        if(tipping.bettingTeam.toLowerCase() !== games[l].winningTeam.toLowerCase()){
                            break;
                        }

                    }
                    heaterBonus++;
                }

                return heaterBonus;

            }

            //For Calculate Game Points
            let getCalculatedGamePoints = async function getCalculatedGamePoints(gameData, compUserData, roundData, userbonus, compNo, totalComp){

                let winningTippingCount = 0;
                let userPoints = 0;

                let tipping_condition = {
                    user: compUserData.userId,
                    game: gameData._id,
                }

                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                if(tipping){
                    if(tipping.bettingTeam.toLowerCase() == gameData.winningTeam.toLowerCase()){
                        winningTippingCount++;
                        let game_tipping_condition = { 
                            game: gameData._id,
                            bettingTeam: tipping.bettingTeam
                        }
            
                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);

                        let gamePoint = 0;
                        let multiplyBy = 1;
                        if(gameData.winningTeam.toLowerCase()=="home"){
                            gamePoint = gameData.homeTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                             userPoints += gamePoint * multiplyBy;
                        }else{
                            gamePoint = gameData.awayTeamPoints;
                            if(roundData.roundtype=="playoff"){
                                multiplyBy *= 2;
                            }

                            if(gameWinningTippingCount==1){
                                multiplyBy *= 2;
                            }
                            let countWinningTippingCount = 0;

                            
                            let game_condition = { 
                                sport: req.query.sportId,
                                gameDate: {$lte: gameData.gameDate},
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let allgames = await commonQuery.findData(GAME, game_condition);
                            let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                            //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1}, 5);
                            for(let l=0; l<sortedgames.length; l++){
                                let tipping_condition = {
                                    user: compUserData.userId,
                                    game: sortedgames[l]._id
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()!==sortedgames[l].winningTeam.toLowerCase()){
                                        break;
                                    }

                                }
                                countWinningTippingCount++;
                            }
                            


                            if(countWinningTippingCount>4){
                                multiplyBy *= 2;
                            }

                            if(userbonus && userbonus.currentBonus==2){
                                multiplyBy *= 2;
                            }else if(userbonus && userbonus.currentBonus==3){
                                multiplyBy *= 3;
                            }else{
                                multiplyBy *= 1;
                            }
                            userPoints += gamePoint * multiplyBy;
                        }


                    }
                }

                return {
                    winningTippingCount: winningTippingCount,
                    userPoints: userPoints
                }

            }

            let updateUserdata = async function updateUserdata(userList, compList, roundList, compNo, totalComp){

                // console.log("STARTUPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);


                let userData = {
                    user: {},
                    currentRoundPoints: 0.00,
                    previousRoundPoints: 0.00,
                    seasonPoints: 0.00,
                    heaterBonus: 0
                }

                userData.user = userList.userId;
                userList.userRoundPoints = [];

                //calculate round points
                for(let j=0; j<roundList.data.length; j++){

                    let userbonus_condition = {
                        user: userList.userId,
                        comp: userList.competitionId,
                        round: roundList.data[j]._id
                    }
                    let userbonus = await commonQuery.fetch_one(USERBONUS, userbonus_condition);

                    let userRoundPoint = {
                        roundId: '',
                        roundNo: 0,
                        roundState: '',
                        points: 0
                    }

                    let userPoints = 0;
                    let winningTippingCount = 0;


                    let game_condition = { 
                        round: roundList.data[j]._id,
                        winningTeam: {$ne: ""},
                        isDeleted: false
                    }

                    let games = await commonQuery.findData(GAME, game_condition);

                    for(let k=0; k<games.data.length; k++){

                        let calculatedPoints = await getCalculatedGamePoints(games.data[k], userList, roundList.data[j], userbonus, compNo, totalComp);
                        console.log("CALCULATEDPOINTS: ", calculatedPoints);

                        userPoints = userPoints + calculatedPoints.userPoints;
                        winningTippingCount = winningTippingCount + calculatedPoints.winningTippingCount;

                    }

                    if(winningTippingCount!==0 && winningTippingCount==games.data.length){
                        userPoints = userPoints + compList.bonuspoint;
                    }

                    if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==0){
                        userRoundPoint.roundState = "past";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                        userData.seasonPoints = (parseFloat(userData.seasonPoints) + userPoints).toFixed(2);


                    }else if(isDateBetween(roundList.data[j].startDate, roundList.data[j].endDate, currentDate)==1){
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints;
                        userRoundPoint.roundState = "present";
                        userData.currentRoundPoints = userPoints.toFixed(2);
                        userData.seasonPoints = parseFloat(parseFloat(userData.seasonPoints) + userPoints).toFixed(2);
                        if(userRoundPoint.roundNo>1){
                            let previousRound = userList.userRoundPoints.find(round=>round.roundNo==userRoundPoint.roundNo-1);
                            userData.previousRoundPoints = parseFloat(previousRound.points).toFixed(2);
                        }else{
                            userData.previousRoundPoints = parseFloat(userData.previousRoundPoints).toFixed(2);

                        }

                        let game_condition = { 
                            sport: req.query.sportId,
                            winningTeam: {$ne: ""},
                            isDeleted: false
                        }

                        let heaterBonus = 0;

                        let allgames = await commonQuery.findData(GAME, game_condition);
                        let sortedgames = allgames.data.sort(function(a,b){return new Date(b.gameDate) - new Date(a.gameDate)});
                        //let sortedgames = await commonQuery.findDataBySortSkipLimit(GAME, game_condition, {gameDate: 1});
                        heaterBonus = await getCalculatedHeaterBonus(sortedgames, userList);

                        userData.heaterBonus = heaterBonus;
                    }else{
                        userRoundPoint.roundState = "future";
                        userRoundPoint.roundId = roundList.data[j]._id;
                        userRoundPoint.roundNo = roundList.data[j].roundno;
                        userRoundPoint.points = userPoints.toFixed(2);
                    }

                    userList.userRoundPoints.push(userRoundPoint);
                }


                let obj_update = {
                    seasonPoints: parseFloat(userData.seasonPoints),
                    currentRoundPoints: parseFloat(userData.currentRoundPoints),
                    previousRoundPoints: parseFloat(userData.previousRoundPoints),
                    heaterBonus: parseInt(userData.heaterBonus)
                }
                let updateCondition = {
                    _id: userList._id
                };
                let update_join_comp = await commonQuery.updateOneDocument(JOINCOMP, updateCondition, obj_update);
                console.log("UPDATE COMP_NO: "+compNo+" >>>TOTAL_COMP: "+totalComp);
                console.log("END TIME: ", new Date())

            }

            let round_condition = { 
                isDeleted: false,
            }

            let roundList = await commonQuery.findData(ROUND, round_condition);

            let joincomp_condition = { 
                isDeleted: false,
                isJoined: true
            }


            let query = JOINCOMP.find(joincomp_condition);
            query.populate({
                path: 'competitionId',
                select: 'sport competitionname bonuspoint bonus2xpoint bonus3xpoint'
            }).lean().exec(function (err, userList) {
                if(userList){
                    console.log("USERLIST: ", userList[0])
                    console.log("USERLISTLENGTH: ", userList.length)
                    console.log("START TIME: ", new Date())
                    // let i = 0;
                    // updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);


                    for(let i=0; i<userList.length; i++){
                        

                        updateUserdata(userList[i], userList[i].competitionId, roundList, i+1, userList.length);

                    }
                }
            });

        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}

function updateJoinCompDelete(req, res) {
    async function asy_init() {
        try {


            let comp_condition = { 
                isDeleted: true,
            }

            let compList = await commonQuery.findData(COMP, comp_condition);

            for(let i=0; i<compList.data.length; i++){
                let joincomp_condition = {
                    isDeleted: false,
                    competitionId: compList.data[i]._id
                }

                let update_join_comp = {
                    isDeleted: true
                }

                let updateJoinComp = await commonQuery.updateAllDocument(JOINCOMP, joincomp_condition, update_join_comp);
                console.log("COMPNO: ", i+1);

                console.log("UPDATEJOIN: ", updateJoinComp);

            }

            return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, {}, 0);


        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }

    }
    asy_init();
}