'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    config = require('../../../../config/config.js').get(process.env.NODE_ENV),
    FCM = require('fcm-node'),
    fcm = new FCM(config.fcmServerKey),
    GAME = mongoose.model('game'),
    ROUND = mongoose.model('round'),
    SPORT = mongoose.model('sport'),
    TIPPING = mongoose.model('tipping'),
    SETTING = mongoose.model('setting'),
    USER = mongoose.model('user'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    response = require('../../../../lib/response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

    module.exports = {
        sendGameNotification: sendGameNotification,
        sendGameStartNotification: sendGameStartNotification,
        updateGameState: updateGameState
    };


    function sendGameNotification(req, res) {
        async function asy_init() {
            try {
    
                if (!mongoose.Types.ObjectId.isValid(req.query.roundId)) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
                }
    
                let condition = { 
                    isDeleted: false
                }
    
                let query = USER.find(condition);
                query.populate({
                    path: 'role',
                    select: 'rolename'
                })
                .lean().exec(function (err, userList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }
    
                    (async  () => {
    
                    for(let i=0; i<userList.length; i++){

                            let game_empty_condition = { 
                                round: req.query.roundId,
                                winningTeam: "",
                                isDeleted: false
                            }
    
                            let emptyGames = await commonQuery.findData(GAME, game_empty_condition);

                            if(emptyGames.data.length<=0){

                                let round_condition = {
                                    _id: req.query.roundId
                                }
    
                                let currentRound = 
                                await commonQuery.findData(ROUND, round_condition);

                                let round_upcoming_condition = {
                                    sport: currentRound.data[0].sport,
                                    roundno: currentRound.data[0].roundno+1
                                }

                                let upcomingRound = await commonQuery.findData(ROUND, round_upcoming_condition);

                                if(upcomingRound.data.length>0 && upcomingRound.data[0].roundtype=="Playoffs"){

                                    if(userList[i].isKingBotNotification){

                                        var message = {
                                            to: userList[i].deviceToken, 
                                            collapse_key: 'your_collapse_key',
                                            
                                            notification: {
                                                title: 'Kingbot', 
                                                body: "It's time to liven things up around this joint, double points for the rest of the year. Let the Finals Footy Frenzy begin!" 
                                            }
                                        };
                                        
                                        fcm.send(message, function(err, response){
                                            if (err) {
                                                console.log("Something has gone wrong!");
                                            } else {
                                                console.log("Successfully sent with response: ", response);
                                            }
                                        });

                                    }



                                }


                            }




    
                            let game_condition = { 
                                round: req.query.roundId,
                                winningTeam: {$ne: ""},
                                isDeleted: false
                            }
    
                            let games = await commonQuery.findData(GAME, game_condition);


    
                            for(let k=0; k<games.data.length; k++){
                                
                                let tipping_condition = {
                                    user: userList[i]._id,
                                    game: games.data[k]._id,
                                }
    
                                let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                if(tipping){
                                    if(tipping.bettingTeam.toLowerCase()==games.data[k].winningTeam.toLowerCase()){
                                        let game_tipping_condition = { 
                                            game: games.data[k]._id,
                                            bettingTeam: tipping.bettingTeam
                                        }
                            
                                        let gameWinningTippingCount = await commonQuery.countData(TIPPING, game_tipping_condition);

                                        if(games.data[k].winningTeam.toLowerCase()=="home"){
    
                                            if(gameWinningTippingCount==1 && games.data[k].homeTeamPoints<games.data[k].awayTeamPoints){
                                                //SmugTip winner

                                                if(userList[i].isKingBotNotification){
                                                    var message = {
                                                        to: userList[i].deviceToken, 
                                                        collapse_key: 'your_collapse_key',
                                                        
                                                        notification: {
                                                            title: 'Kingbot', 
                                                            body: 'Congratulations, who would of thought. You nailed that smugtip bonus. You just scored yourself some double points for that game. Let your friends know' 
                                                        }
                                                    };
                                                    
                                                    fcm.send(message, function(err, response){
                                                        if (err) {
                                                            console.log("Something has gone wrong!");
                                                        } else {
                                                            console.log("Successfully sent with response: ", response);
                                                        }
                                                    });
                                                }

                                            }
                                            let countWinningTippingCount = 0;
                                            if(k>3){
                                                for(let l=k-1; l>=0; l--){
                                                    let tipping_condition = {
                                                        user: userList[i]._id,
                                                        game: games.data[l]._id
                                                    }
                        
                                                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                                    if(tipping){
                                                        if(tipping.bettingTeam.toLowerCase()!==games.data[l].winningTeam.toLowerCase()){
                                                            break;
                                                        }
        
                                                    }
                                                    countWinningTippingCount++;
                                                }
                                            }

    
    
                                            if(countWinningTippingCount>=4){
                                                //heater bonus winner
                                                // if(userList[i].isKingBotNotification){
                                                //     var message = {
                                                //         to: userList[i].deviceToken, 
                                                //         collapse_key: 'your_collapse_key',
                                                        
                                                //         notification: {
                                                //             title: 'Kingbot', 
                                                //             body: 'Hotdog, miracles do happen! Look who is on a heater bonus. Double points for you until you get the next game wrong.' 
                                                //         }
                                                //     };
                                                    
                                                //     fcm.send(message, function(err, response){
                                                //         if (err) {
                                                //             console.log("Something has gone wrong!");
                                                //         } else {
                                                //             console.log("Successfully sent with response: ", response);
                                                //         }
                                                //     });
                                                // }

                                            }
    
                                        }else{
    
                                            if(gameWinningTippingCount==1 && games.data[k].awayTeamPoints<games.data[k].homeTeamPoints){
                                                //smug tip winner
                                                if(userList[i].isKingBotNotification){
                                                    var message = {
                                                        to: userList[i].deviceToken, 
                                                        collapse_key: 'your_collapse_key',
                                                        
                                                        notification: {
                                                            title: 'Kingbot', 
                                                            body: 'Congratulations, who would of thought. You nailed that smugtip bonus. You just scored yourself some double points for that game. Let your friends know' 
                                                        }
                                                    };
                                                    
                                                    fcm.send(message, function(err, response){
                                                        if (err) {
                                                            console.log("Something has gone wrong!");
                                                        } else {
                                                            console.log("Successfully sent with response: ", response);
                                                        }
                                                    });
                                                }

                                            }
                                            let countWinningTippingCount = 0;
                                            if(k>3){
                                                for(let l=k; l>=0; l--){
                                                    let tipping_condition = {
                                                        user: userList[i].userId,
                                                        game: games.data[l]._id
                                                    }
                        
                                                    let tipping = await commonQuery.fetch_one(TIPPING, tipping_condition);
                                                    if(tipping){
                                                        if(tipping.bettingTeam.toLowerCase()!==games.data[l].winningTeam.toLowerCase()){
                                                            break;
                                                        }
        
                                                    }
                                                    countWinningTippingCount++;
                                                }
                                            }
    
    
                                            if(countWinningTippingCount>=4){
                                                //heater bonus winner
                                                // if(userList[i].isKingBotNotification){
                                                //     var message = {
                                                //         to: userList[i].deviceToken, 
                                                //         collapse_key: 'your_collapse_key',
                                                        
                                                //         notification: {
                                                //             title: 'Kingbot', 
                                                //             body: 'Hotdog, miracles do happen! Look who is on a heater bonus. Double points for you until you get the next game wrong.' 
                                                //         }
                                                //     };
                                                    
                                                //     fcm.send(message, function(err, response){
                                                //         if (err) {
                                                //             console.log("Something has gone wrong!");
                                                //         } else {
                                                //             console.log("Successfully sent with response: ", response);
                                                //         }
                                                //     });
                                                // }

                                            }
    
                                        }
    
    
                                    }
                                }
    
                            
                            }
    
                        
                    }
    
                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, null);

                })();
    
            })
    
            } catch (e) {
                return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
    
            }
    
        }
        asy_init();
    }

    function sendGameStartNotification(req, res) {
        async function asy_init() {
            try {
    
                if (!mongoose.Types.ObjectId.isValid(req.body.gameId)) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
                }
    
                let condition = { 
                    isDeleted: false
                }
    
                let query = USER.find(condition);
                query.populate({
                    path: 'role',
                    select: 'rolename'
                })
                .lean().exec(function (err, userList) {
                    if(err){
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }
    
                    (async  () => {
    
                    for(let i=0; i<userList.length; i++){

                        if(userList[i].isKingBotNotification){
                            var message = {
                                to: userList[i].deviceToken, 
                                collapse_key: 'your_collapse_key',
                                
                                notification: {
                                    title: 'Kingbot', 
                                    body: "Get excited, the next round is about to start. If you think you're going to beat me... think again." 
                                }
                            };
                            
                            fcm.send(message, function(err, response){
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            });
                        }


                            
                    }
    
                    return response(res, Constant.SUCCESS_CODE, Constant.NOTIFICATION_SENT_SUCCESS, null);

                })();
    
            })
    
            } catch (e) {
                return response(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
    
            }
    
        }
        asy_init();
    }


    function updateGameState(req, res) {
        async function asy_init() {
            try {

                let sport_condition = { 
                    isDeleted: false
                }
    
                let sports = await commonQuery.findData(SPORT, sport_condition);
                for(let i=0; i<sports.data.length; i++){

                    let round_condition = { 
                        isDeleted: false,
                        sport: sports.data[i]._id
                    }
        
                    let rounds = await commonQuery.findData(ROUND, round_condition);

                    for(let j=0; j<rounds.data.length; j++){

                        if(rounds.data[j].roundno==1){
                            let game_condition = { 
                                isDeleted: false,
                                round: rounds.data[j]._id
                            }
                
                            let games = await commonQuery.findData(GAME, game_condition);

                            for(let k=0; k<games.data.length; k++){

                                let gameDateTime = new Date(games.data[k].gameDate);
                                let settingData = await commonQuery.fetch_one(SETTING, {type:"testing"});
                                let currentDate = new Date();
                                // if(settingData && settingData.isTesting){
                                //     currentDate = settingData.currentDate;
                                // }else{
                                //     currentDate = new Date();
                                // }
                                let currentDateTime = new Date(currentDate)

                                console.log(games.data[k].gameState+"----"+currentDateTime+"="+gameDateTime)
                                if(games.data[k].gameState=="open" && currentDateTime>gameDateTime){

                                    let obj_update = {
                                        gameState: "started"
                                    }
                        
                                    let updateCondition = {
                                        _id: games.data[k]._id
                                    };
                                    let gameData = await commonQuery.updateOneDocument(GAME, updateCondition, obj_update)

                                }

                                if(k==0){
                                    let availableTime = gameDateTime.getTime() - currentDateTime.getTime(); // This will give difference in milliseconds
                                    let availableTimeInMin = Math.round(availableTime / 60000);

                                    if(availableTimeInMin==60){
                                        let user_condition = { 
                                            isDeleted: false
                                        }
                            
                                        let users = await commonQuery.findData(USER, user_condition);

                                        for(let l=0; l<users.data.length; l++){

                                            var message = {
                                                to: users.data[l].deviceToken, 
                                                collapse_key: 'your_collapse_key',
                                                
                                                notification: {
                                                    //title: 'RugbyTipping', 
                                                    body: 'Oi, don’t forget to put your tips in! You out of everyone need this the most.' 
                                                }
                                            };
                                            
                                            fcm.send(message, function(err, response){
                                                if (err) {
                                                    console.log("Something has gone wrong!");
                                                } else {
                                                    console.log("Successfully sent with response: ", response);
                                                }
                                            });

                                        }

                                    }


                                }

                                

                            }

                        }else{

                            let game_condition = { 
                                isDeleted: false,
                                round: rounds.data[j]._id
                            }
                
                            let games = await commonQuery.findData(GAME, game_condition);

                            for(let k=0; k<games.data.length; k++){

                                let gameDateTime = new Date(games.data[k].gameDate);
                                let settingData = await commonQuery.fetch_one(SETTING, {type:"testing"});
                                let currentDate = new Date();
                                // if(settingData.isTesting){
                                //     currentDate = settingData.currentDate;
                                // }else{
                                //     currentDate = new Date();
                                // }

                                let currentDateTime = new Date(currentDate);
                                console.log(games.data[k].gameState+"----"+currentDateTime+"="+gameDateTime)

                                if(games.data[k].gameState=="open" && currentDateTime>gameDateTime){

                                    let obj_update = {
                                        gameState: "started"
                                    }
                        
                                    let updateCondition = {
                                        _id: games.data[k]._id
                                    };
                                    let gameData = await commonQuery.updateOneDocument(GAME, updateCondition, obj_update)

                                }                                

                            }

                        }

                    }

                }

                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, null);

    
    
            } catch (e) {
                return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
    
            }
    
        }
        asy_init();
    }
    