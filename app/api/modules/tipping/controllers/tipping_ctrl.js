'use strict';

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    SETTING = mongoose.model('setting'),
    TIPPING = mongoose.model('tipping'),
    AD = mongoose.model('ad'),
    ROLE = mongoose.model('role'),
    GAME = mongoose.model('game'),
    USER = mongoose.model('user'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    commonQuery = require('../../../../lib/commonQuery.js');

module.exports = {
    saveTipping: saveTipping,
    addAutoTipping: addAutoTipping
};


function saveTipping(req, res) {
    async function asy_save_tipping() {
       
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

            let tippings = req.body.tippings;
            let userId = req.body.userId;

            for(var i=0; i<tippings.length; i++){

                let condition_exist = {
                    user: userId,
                    game: tippings[i].gameId,
                    isDeleted: false
                }
                let tipping_exist = await commonQuery.fetch_one(TIPPING, condition_exist)
                if (tipping_exist) {
    
                    let obj_update = {
                        "bettingTeam": tippings[i].bettingTeam
                    }
                    let updateCondition = {
                        _id: tipping_exist.id
                    };
                    let tippingData = await commonQuery.updateOneDocument(TIPPING, updateCondition, obj_update);
             
                }else{
                    let tippingdata = {
                        "user": userId,
                        "game": tippings[i].gameId,
                        "bettingTeam": tippings[i].bettingTeam,
                    }
                    let tippingData = await commonQuery.InsertIntoCollection(TIPPING, tippingdata)
    
                    
    
                }

            }

            let condition_ad = {
                type: "tipping_success",
                isDeleted: false
            }
            let ad = await commonQuery.fetch_one(AD, condition_ad)
            return mresponse(res, Constant.SUCCESS_CODE, Constant.SAVE_TIPPING_SUCCESS, ad);




        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };


    }
    asy_save_tipping();
}

function addAutoTipping(req, res) {
    async function asy_add_auto_tipping() {
       
        try {

            let user_role_condition = { 
                rolename: 'user'
            }

            let user_role = await commonQuery.fetch_one(ROLE, user_role_condition);

            let kingbot_role_condition = { 
                rolename: 'kingbot'
            }

            let kingbot_role = await commonQuery.fetch_one(ROLE, kingbot_role_condition);

            let gameId = req.query.gameId;

            let game_condition = { 
                _id: gameId
            }

            // let games = await commonQuery.findData(GAME, game_condition);
            let game = await commonQuery.fetch_one(GAME, game_condition);
            if(game){

                //for(var i=0; i<games.data.length; i++){

                    if(game.gameState!=="open"){

                        let user_condition = { 
                            isDeleted: false,
                            isVerified: true
                        }

                        user_condition['$or'] = [{
                            role: user_role._id
                        },
                        {
                            role: kingbot_role._id
                        }]
                        
            
                        let users = await commonQuery.findData(USER, user_condition);

                        if(users.data.length>0){
                            for(let j=0; j<users.data.length; j++){

                                let condition_exist = {
                                    user: users.data[j]._id,
                                    game: game._id,
                                    isDeleted: false
                                }
                                let tipping_exist = await commonQuery.fetch_one(TIPPING, condition_exist)
                                if (!tipping_exist) {

                                    let bettingTeam = "away";
                                    if(users.data[j].role.equals(kingbot_role._id)){
                                        if(game.homeTeamPoints>game.awayTeamPoints){
                                            bettingTeam = "home";
                                        }
                                    }

                                    let tippingdata = {
                                        "user": users.data[j]._id,
                                        "game": game._id,
                                        "bettingTeam": bettingTeam,
                                    }
                                    let tippingData = await commonQuery.InsertIntoCollection(TIPPING, tippingdata)
            
                                }

                            }
                        }

                    }
    
                //}
                return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_SAVE_SUCCESS);

            }

        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        };


    }
    asy_add_auto_tipping();
}