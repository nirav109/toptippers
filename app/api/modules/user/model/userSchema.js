'use strict';
var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    dob: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role',
    },
    sport: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'sport',
    }],
    favCompetition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comp',
        default: null
    },
    favSport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sport',
        default: null
    },
    deviceToken: {
        type: String
    },
    deviceType: {
        type: String
    },
    joinedDate: {
        type: Number
    },

    verification_token: {
        type: String
    },
    resetKey: {
        type: String
    },
    isKingBotNotification: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
})

UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.index({ firstname: 1 });
var user = mongoose.model('user', UserSchema);
module.exports = user;