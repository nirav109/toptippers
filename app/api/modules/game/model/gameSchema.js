'use strict';
var mongoose = require('mongoose');

var gameSchema = new mongoose.Schema({
    gameTitle: {
        type: String
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sport',
    },
    gameState: {
        type: String,
        enum: ['open', 'inprogress', 'finished']
    },
    winningTeam: {
        type: String
    },
    eventId: {
        type: String
    },
    round: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'round',
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    homeTeamPoints: {
        type: Number,
        default: 0

    },
    awayTeamPoints: {
        type: Number,
        default: 0
    },
    homeSeasonPoints: {
        type: Number,
        default: 0

    },
    awaySeasonPoints: {
        type: Number,
        default: 0
    },
    homeTopTipperPoints: {
        type: Number,
        default: 0

    },
    awayTopTipperPoints: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    season: {
        type: String,
        enum: ['current', 'past']
    },
    gameDate: {
        type: String
    },
    gameTime: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
var game = mongoose.model('game', gameSchema);
module.exports = game;

// -sport: enum type being either ‘AFL’ or ‘NRL’
// -date
// -game state: enum [‘finished’, ‘in progress’, ‘open’]
// -round (String because in the playoffs this will be text. Example: ‘QF’ for quarter finals
// -round number: we need the round to have  a number to so we can put the rounds in order.
// -home team
// -away team
// -home team points scored in this game
// -away team points scored in this game
// -winning team [home/away/draw] // this gets set when this game is set to “finished”
// -home team points awarded(floating point number)   
// -away team points awarded(floating point number)

// -season: enum [ current, past] ///past is for the season that just happened