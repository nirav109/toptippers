'use strict';

const { constant } = require('async');

var mongoose = require('mongoose'),
    Constant = require('../../../../config/constant.js'),
    config = require('../../../../config/config.js').get(process.env.NODE_ENV),
    FCM = require('fcm-node'),
    fcm = new FCM(config.fcmServerKey),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    crypto = require("crypto"),
    Constant = require('../../../../config/constant.js'),
    USER = mongoose.model('user'),
    ROLE = mongoose.model('role'),
    COMP = mongoose.model('comp'),
    SETTING = mongoose.model('setting'),
    GAME = mongoose.model('game'),
    TIPPING = mongoose.model('tipping'),
    JOINCOMP = mongoose.model('joincomp'),
    SPORT = require("../../sport/model/sportSchema"),
    USERSPORTS = mongoose.model('usersports'),
    mails = require('../../../../lib/mails'),
    response = require('../../../../lib/response_handler.js'),
    mresponse = require('../../../../lib/mobile_response_handler.js'),
    validator = require('../../../../config/validator.js'),
    Config = require('../../../../config/config.js').get(process.env.NODE_ENV),
    utility = require('../../../../lib/utility.js'),
    commonQuery = require('../../../../lib/commonQuery.js'),
    validate = require('../../../../config/validator');

module.exports = {
    register: register,
    registerUser: registerUser,
    userLogin: userLogin,
    userLogout: userLogout,
    userAdminLogin: userAdminLogin,
    getUserList: getUserList,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    changePassword: changePassword,
    verifyEmail: verifyEmail,
    addUser: addUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getUserDetails: getUserDetails,
    updateProfilePic: updateProfilePic,
    deActivateUser: deActivateUser,
    getAuthDetails: getAuthDetails,
    getFindUsers: getFindUsers,
    updateFavCompetition: updateFavCompetition,
    updateFavSport: updateFavSport,
    updateName: updateName,
    updateKingBotNotification: updateKingBotNotification,
    inviteUsers: inviteUsers,
    verifiedAccount: verifiedAccount,
    sendMessage: sendMessage,
    deleteUsers: deleteUsers,
    getAllUserList: getAllUserList,
    addUserSports: addUserSports

};

/* Function is use to  register User with image
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function registerUser(req, res) {
    async function asy_add_user() {
        try {
            var password = req.body.password;
            let role_cond = {
                rolename: 'user'
            }
            let roleData = await commonQuery.fetch_one(ROLE, role_cond)
            let role_id = roleData.id
            var tokenn;
            crypto.randomBytes(20, await
                function(err, buf) {
                    tokenn = buf.toString('hex');
                });
            try {
                if (req.body.email && req.body.password) {
                    let condition_exist = {
                        email: req.body.email,
                        isDeleted: false
                    }
                    let customer_exist = await commonQuery.fetch_one(USER, condition_exist)
                    if (customer_exist) {
                        return mresponse(res, Constant.ALLREADY_EXIST, Constant.EMAIL_ALREADY_REGISTERED);
                    } else {
                        // console.log("elsepart-----------------")
                        if (req.files != null) {
                            let file_name = req.files.file.name;
                            let str = file_name.split(".");
                            if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "jpeg") {
                                var orignalProfileName = 'profile_' + utility.generateRandomString() + '.' + str[1];
                                let profilePath = Constant.PROFILE_IMG_PATH + orignalProfileName;
                                //upload image
                                fs.writeFile(profilePath, (req.files.file.data), function(data, err) {
                                    if (err) throw err;
                                })
                            }
                        }
                        let username = validate.extractNameFromEmail(req.body.email);
                        let registerdata = {
                                username: username,
                                firstname: req.body.firstname || '',
                                lastname: req.body.lastname || '',
                                profilePhoto: orignalProfileName || '',
                                name: req.body.name,
                                email: req.body.email,
                                dob: req.body.dob,
                                password: password,
                                role: role_id,
                                country: req.body.country,
                                joinedDate: utility.removeOffset(new Date())
                            }
                            // console.log("register data", registerdata)
                        let user = await commonQuery.InsertIntoCollection(USER, registerdata)
                        if (user) {
                            try {
                                var UserData = {
                                    verification_token: tokenn,
                                    // verificationExpires: Date.now() + 3600000, // 1 hour
                                }
                                USER.findOneAndUpdate({
                                    _id: user._id
                                }, {
                                    $set: UserData
                                }, function(err, userDataa) {})
                                let metadata = {
                                    // USER_NAME:user.username,
                                    FIRST_NAME: user.name,
                                    // LAST_NAME: user.lastname,
                                    EMAIL: user.email,
                                    ROLE: user.role,
                                    VERIFICATION_TOKEN: UserData.verification_token,
                                    API_URL: Config.baseUrl
                                }
                                let registereddata = {
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                }
                                let user_email = []
                                user_email.push(user.email)
                                let SENT_MAIL_VALUE = await mails.send(Constant.WELCOME_USER_TEMPLATE_CODE, metadata, user_email)
                                return mresponse(res, Constant.SUCCESS_CODE, Constant.NEW_USER_SAVE_SUCCESS, registereddata);
                            } catch (err) {
                                return mresponse(res, Constant.ERROR_CODE, err);
                            }
                        }
                    }
                } else {
                    return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
                }
            } catch (err) {
                return mresponse(res, Constant.ERROR_CODE, err);
            };
        } catch (err) { return mresponse(res, Constant.ERROR_CODE, err); }
    }
    asy_add_user();
}


/* Function is use to Register new User
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function register(req, res) {
    // console.log("register", req.body)
    async function asy_add_user() {
        try {
            var password = req.body.password;
            let role_cond = {
                rolename: 'user'
            }
            let roleData = await commonQuery.fetch_one(ROLE, role_cond)
            let role_id = roleData.id
            var tokenn;
            crypto.randomBytes(20, await
                function(err, buf) {
                    tokenn = buf.toString('hex');
                });
            try {
                if (req.body.email && req.body.password) {
                    let condition_exist = {
                        email: req.body.email,
                        isDeleted: false
                    }
                    let customer_exist = await commonQuery.fetch_one(USER, condition_exist)
                    if (customer_exist) {
                        return mresponse(res, Constant.ALLREADY_EXIST, Constant.EMAIL_ALREADY_REGISTERED);
                    } else {
                        // console.log("enter")
                        let username = validate.extractNameFromEmail(req.body.email);
                        let registerdata = {
                                username: username,
                                firstname: req.body.firstname || '',
                                lastname: req.body.lastname || '',
                                name: req.body.name,
                                email: req.body.email,
                                password: password,
                                role: role_id,
                                joinedDate: utility.removeOffset(new Date())
                            }
                            // console.log("register data", registerdata)
                        let user = await commonQuery.InsertIntoCollection(USER, registerdata)
                        if (user) {
                            try {
                                var UserData = {
                                    verification_token: tokenn,
                                    // verificationExpires: Date.now() + 3600000, // 1 hour
                                }
                                USER.findOneAndUpdate({
                                    _id: user._id
                                }, {
                                    $set: UserData
                                }, function(err, userDataa) {

                                })
                                let metadata = {
                                    // USER_NAME:user.username,
                                    FIRST_NAME: user.name,
                                    // LAST_NAME: user.lastname,
                                    EMAIL: user.email,
                                    ROLE: user.role,
                                    VERIFICATION_TOKEN: UserData.verification_token,
                                    API_URL: Config.baseUrl
                                }
                                let registereddata = {
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                }
                                let user_email = []
                                user_email.push(user.email)
                                let SENT_MAIL_VALUE = await mails.send(Constant.WELCOME_USER_TEMPLATE_CODE, metadata, user_email)
                                return mresponse(res, Constant.SUCCESS_CODE, Constant.NEW_USER_SAVE_SUCCESS, registereddata);
                            } catch (err) {
                                return mresponse(res, Constant.ERROR_CODE, err);
                            }
                        }
                    }
                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
            } catch (err) {
                return mresponse(res, Constant.ERROR_CODE, err);
            };
        } catch (err) { return mresponse(res, Constant.ERROR_CODE, err); }
    }
    asy_add_user();
}

/* Function is use to Login registered user
 * @access private
 * @return jsoncompareSync
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function userLogin(req, res) {
    console.log("req----------", req.body)
    async function asy_init_login() {
        try {
            if (req.body.email && req.body.password) {
                console.log("req email password-----", req.body.email, req.body.password)
                let condition = {
                    email: req.body.email,
                    isDeleted: false
                }
                var user = await commonQuery.findoneData(USER, condition);
                console.log("user-----", user)
                if (user) {
                    user.comparePassword(req.body.password, async function(err, isMatch) {
                        if (isMatch) {
                            console.log("isMatch------")
                            if (user.isActive == true) {
                                console.log("isActive------")
                                let params = {
                                    id: user._id,
                                    email: user.email
                                };
                                let jwtToken = jwt.sign(params, Config.SECRET, {
                                    expiresIn: '365d'
                                });
                                let rolename = "";
                                let role_cond = {
                                    _id: user.role
                                }
                                await commonQuery.findoneData(ROLE, role_cond).then(async roleData => {
                                    rolename = roleData.rolename
                                })
                                if (req.body.isAdmin && rolename != "admin") {
                                    return mresponse(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                                } else {
                                    if (validator.isValid(jwtToken)) {
                                        if (user.isVerified) {
                                            let userdata = {}
                                            userdata.name = user.name,
                                                userdata.email = user.email,
                                                userdata.role = rolename,
                                                userdata.profilePic = user.profilePhoto || '',
                                                userdata.userId = user._id,
                                                userdata.token = 'Bearer ' + jwtToken
                                            let obj_update = {
                                                deviceToken: req.body.device_token ? req.body.device_token : "",
                                                deviceType: req.body.device_type ? req.body.device_type : ""
                                            }
                                            let updateCondition = {
                                                _id: user._id
                                            };
                                            console.log("user user", user);
                                            if (user) {
                                                if (user.sport == "") {
                                                    userdata.isAddedSports = false;
                                                } else {
                                                    userdata.isAddedSports = true;
                                                }
                                            }

                                            let comJoinCondition = {
                                                userId: user._id,
                                                isDeleted: false
                                            }
                                            var comp = await commonQuery.findoneData(JOINCOMP, comJoinCondition);
                                            // if (comp !== null) {
                                            //     userdata.isJoinCom = true;
                                            // } else {
                                            //     userdata.isJoinCom = true;
                                            // }

                                            let comCondition = {
                                                createdBy: user._id
                                            }
                                            var compCreatedList = await commonQuery.findoneData(COMP, comCondition)

                                            console.log("Comp Comp : ", compCreatedList)

                                            if (comp) {
                                                console.log("inside a if Comditiond .... .... .. . .");
                                                if (comp.competitionId == "") {
                                                    userdata.isJoinCom = false;
                                                    if (compCreatedList) {
                                                        userdata.isJoinCom = true
                                                    } else {
                                                        userdata.isJoinCom = false
                                                    }
                                                } else {
                                                    userdata.isJoinCom = true;
                                                }
                                            } else {
                                                userdata.isJoinCom = false;
                                            }
                                            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)

                                            return mresponse(res, Constant.SUCCESS_CODE, Constant.SIGNIN_SUCCESS, userdata);
                                        } else {
                                            return mresponse(res, Constant.ERROR_CODE, Constant.EMAIL_NOT_VERIFIED);
                                        }

                                    } else {
                                        return mresponse(res, Constant.ERROR_CODE, Constant.INVALID_TOKEN);
                                    }
                                }

                            } else {
                                return mresponse(res, Constant.AUTH_CODE, Constant.UNAUTHORIZE_USER);

                            }
                        } else {
                            return mresponse(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                        }
                    })
                } else {
                    return mresponse(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                }
            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.LOGIN_REQUIRED_FIELDS);
            }
        } catch (e) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_init_login();
}

function userAdminLogin(req, res) {
    console.log("req----------", req.body)
    console.log("Admin login --------->", req.body)
    async function asy_init_login() {
        try {
            if (req.body.email && req.body.password) {
                console.log("req email password-----", req.body.email, req.body.password)
                let condition = {
                    email: req.body.email,
                    isDeleted: false
                }
                console.log("inside ifffff");
                var user = await commonQuery.findoneData(USER, condition);

                console.log("user-----", user)
                if (user) {
                    user.comparePassword(req.body.password, async function(err, isMatch) {
                        if (isMatch) {
                            console.log("isMatch------")
                            if (user.isActive == true) {
                                console.log("isActive------")
                                let params = {
                                    id: user._id,
                                    email: user.email
                                };
                                let jwtToken = jwt.sign(params, Config.SECRET, {
                                    expiresIn: '365d'
                                });
                                let rolename = "";
                                let role_cond = {
                                    _id: user.role
                                }
                                await commonQuery.findoneData(ROLE, role_cond).then(async roleData => {
                                    rolename = roleData.rolename
                                })
                                if (req.body.isAdmin && rolename != "admin") {
                                    return response(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                                } else {
                                    if (validator.isValid(jwtToken)) {
                                        if (user.isVerified) {
                                            let userdata = {}
                                            userdata.name = user.name,
                                                userdata.email = user.email,
                                                userdata.role = rolename,
                                                userdata.profilePic = user.profilePhoto || '',
                                                userdata.userId = user._id,
                                                userdata.token = 'Bearer ' + jwtToken
                                            let obj_update = {
                                                deviceToken: req.body.device_token ? req.body.device_token : "",
                                                deviceType: req.body.device_type ? req.body.device_type : ""
                                            }
                                            let updateCondition = {
                                                _id: user._id
                                            };
                                            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
                                            return response(res, Constant.SUCCESS_CODE, Constant.SIGNIN_SUCCESS, userdata);
                                        } else {
                                            return response(res, Constant.ERROR_CODE, Constant.EMAIL_NOT_VERIFIED);
                                        }

                                    } else {
                                        return response(res, Constant.ERROR_CODE, Constant.INVALID_TOKEN);
                                    }
                                }

                            } else {
                                return response(res, Constant.AUTH_CODE, Constant.UNAUTHORIZE_USER);

                            }
                        } else {
                            return response(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                        }
                    })
                } else {
                    return response(res, Constant.ERROR_CODE, Constant.INVALID_LOGIN_DETAILS);
                }
            } else {
                return response(res, Constant.ERROR_CODE, Constant.LOGIN_REQUIRED_FIELDS);
            }
        } catch (e) {
            return response(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_init_login();
}

/* Function is use to fetch list of all registered User
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getUserList(req, res) {
    async function asy_init() {
        try {
            // let limit = req.body.limit ? req.body.limit : 5;
            // let page = req.body.page ? req.body.page : 0;
            // let offset = limit * page;
            // let search_string = req.body.search_string;

            // let condition = {
            //     isDeleted: false
            // };
            // condition['$or'] = [{
            //     'firstname': new RegExp(search_string, 'gi')
            // },
            // {
            //     'email': new RegExp(search_string, 'gi')
            // }
            // ];
            // sort({
            //     createdAt: -1
            // })
            let count = req.body.count ? parseInt(req.body.count) : 5;
            let skip = 0;
            let page = req.body.page ? req.body.page : 0;
            if (count && page) {
                skip = count * (page);
                // skip = count * (page - 1);
            }
            let search_string = req.body.search_string;
            let condition = { isDeleted: false }
            if (req.body.search_string) {
                //   let concat = {$concat: ["$firstName", " ", "$lastName"]}
                condition['$or'] = [{
                        'name': new RegExp(search_string, 'gi')
                    },
                    {
                        'email': new RegExp(search_string, 'gi')
                    },
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(USER, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let query = USER.find(condition, {
                password: 0
            })
            query.populate({
                    path: 'role',
                    select: 'rolename',
                }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, userList) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: userList,
                        totalCount: totalCount
                    })
                })
                // var userList = await commonQuery.fetchAllLimit(query);
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}

function getAllUserList(req, res) {
    async function asy_init() {
        try {
            // let limit = req.body.limit ? req.body.limit : 5;
            // let page = req.body.page ? req.body.page : 0;
            // let offset = limit * page;
            // let search_string = req.body.search_string;

            // let condition = {
            //     isDeleted: false
            // };
            // condition['$or'] = [{
            //     'firstname': new RegExp(search_string, 'gi')
            // },
            // {
            //     'email': new RegExp(search_string, 'gi')
            // }
            // ];
            // sort({
            //     createdAt: -1
            // })
            let count = req.body.count ? parseInt(req.body.count) : 5;
            let skip = 0;
            let page = req.body.page ? req.body.page : 0;
            if (count && page) {
                skip = count * (page);
                // skip = count * (page - 1);
            }
            let search_string = req.body.search_string;
            let condition = { isDeleted: false }
            if (req.body.search_string) {
                //   let concat = {$concat: ["$firstName", " ", "$lastName"]}
                condition['$or'] = [{
                        'name': new RegExp(search_string, 'gi')
                    },
                    {
                        'email': new RegExp(search_string, 'gi')
                    },
                ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(USER, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let query = USER.find(condition, {
                password: 0
            })
            query.populate({
                    path: 'role',
                    select: 'rolename',
                }).lean().exec(function(err, userList) {
                    return res.json({
                        code: Constant.SUCCESS_CODE,
                        message: Constant.DATA_FETCH_SUCCESS,
                        data: userList,
                        totalCount: totalCount
                    })
                })
                // var userList = await commonQuery.fetchAllLimit(query);
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }

    }
    asy_init();
}

function getFindUsers(req, res) {
    async function asy_init() {
        try {
            // let limit = req.body.limit ? req.body.limit : 5;
            // let page = req.body.page ? req.body.page : 0;
            // let offset = limit * page;
            // let search_string = req.body.search_string;

            // let condition = {
            //     isDeleted: false
            // };
            // condition['$or'] = [{
            //     'firstname': new RegExp(search_string, 'gi')
            // },
            // {
            //     'email': new RegExp(search_string, 'gi')
            // }
            // ];
            // sort({
            //     createdAt: -1
            // })
            let count = req.query.count ? parseInt(req.query.count) : 5;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;

            let search_string = req.query.search;
            let condition = { isDeleted: false }
            if (req.query.search) {
                //   let concat = {$concat: ["$firstName", " ", "$lastName"]}
                condition['$or'] = [{
                    'email': new RegExp(search_string, 'gi')
                }, ]
            }
            // condition['isDeleted'] = false;
            let totalCount = await commonQuery.countData(USER, condition);
            let sortValue = req.body.sortValue || '';
            let sortOrder = req.body.sortOrder || '';
            let sortObject = {}
            if (sortValue && sortOrder) {
                sortObject[sortValue] = sortOrder;
            } else {
                sortObject = { createdAt: -1 } //1 asc -1 desc
            }

            let query = USER.find(condition, {
                password: 0
            })
            query.populate({
                    path: 'role',
                    select: 'rolename',
                }).sort(sortObject).skip(skip).limit(count).lean().exec(function(err, userList) {
                    if (err) {
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG)
                    }

                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCH_SUCCESS, userList, totalCount)
                })
                // var userList = await commonQuery.fetchAllLimit(query);
        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }

    }
    asy_init();
}
/* Function is for Forgot Password
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function forgotPassword(req, res) {
    async function asy_init() {
        try {
            var token;
            crypto.randomBytes(20, function(err, buf) {
                token = buf.toString('hex');
            });
            let condition = {
                email: req.body.email
            }
            var user = await commonQuery.findoneData(USER, condition);
            // console.log("user--", user)
            if (!user) {
                res.json({
                    code: Constant.ERROR_CODE,
                    data: null,
                    message: Constant.USER_NOT_EXIST
                })
            } else {
                var name = user.name;
                var lastname = user.lastname;
                var email = user.email;
                var UserData = {
                    resetKey: token,
                    resetPasswordExpires: Date.now() + 3600000, // 1 hour
                }
                USER.findOneAndUpdate({
                    _id: user._id
                }, {
                    $set: UserData
                }, async function(err, userData) {
                    // console.log("resetkey-------------", userData)
                    if (err) {
                        res.json({
                            code: Constant.ERROR_CODE,
                            data: null,
                            message: Constant.USER_NOT_EXIST
                        })
                    } else {
                        let metadata = {
                                FIRST_NAME: name,
                                LAST_NAME: lastname,
                                EMAIL: email,
                                RESET_KEY: UserData.resetKey,
                                API_URL: Config.baseUrl
                            }
                            // console.log("metadata", metadata)
                        let useremail = []
                        useremail.push(email)
                        let SENT_MAIL_VALUE = await mails.send(Constant.FORGOT_PASSWORD_CODE, metadata, useremail)
                        res.json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.LINK_SENT

                        });

                    }
                });
            }
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_init();
}

/* Function is use to Reset Password after user forgets the password
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

//  using method from schema to encrypt or compare encrypted password

function resetPassword(req, res) {
    async function asy_init() {
        try {
            var resetKey_value = req.body.resetKey_value;
            let condition = { resetKey: resetKey_value }
            var user = await commonQuery.findoneData(USER, condition);
            if (user) {
                user.password = req.body.password;
                user.resetKey = ''
                user.save(async function(err, userDetails) {
                    if (err) {
                        res.json({
                            code: Constant.ERROR_CODE,
                            message: Constant.INTERNAL_ERROR,
                            data: null
                        });
                    } else {
                        let useremail = []
                        useremail.push(user.email)
                        let metadata = {
                            FIRST_NAME: user.name,
                            LAST_NAME: user.lastname,

                        }
                        let SENT_MAIL_VALUE = await mails.send(Constant.RESET_TEMPLATE_CODE, metadata, useremail)
                        res.json({
                            code: Constant.SUCCESS_CODE,
                            message: Constant.PASSWORD_RESET,
                            data: userDetails.email
                        });
                    }
                });
            } else {
                return res.json({
                    code: 400,
                    message: 'Reset password token expires! Regenerate token to set password',
                    data: null
                });
            }
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_init();
}

/* Function is use to Verify email
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function verifyEmail(req, res) {
    async function asy_init() {
        try {
            let verification_token = req.query.token
            let userdata = {};
            USER.findOne({
                'verification_token': verification_token,
            }, function(err, user) {
                if (user == null || undefined) {
                    // return res.json({
                    //     code: Constant.ERROR_CODE,
                    //     message: Constant.INTERNAL_ERROR,
                    //     data: __dirname+'/templates/emailVerificationSuccess.html'
                    // });

                    return res.sendFile(__dirname + '/templates/emailVerificationFailed.html');

                } else {
                    userdata = user;
                    USER.update({
                        _id: user._id
                    }, {
                        $set: {
                            "isVerified": true,
                            'verification_token': ''
                        }
                    }, async function(err, userDetails) {
                        if (err) {
                            // res.json({
                            //     code: Constant.ERROR_CODE,
                            //     message: Constant.VERIFICATION_FAILED,
                            //     data: null
                            // });
                            return res.sendFile(__dirname + '/templates/emailVerificationFailed.html');

                        } else {
                            console.log("userdata: " + JSON.stringify(userdata));
                            console.log("user1: " + JSON.stringify(user))


                            let settingData = await commonQuery.fetch_one(SETTING, { type: "testing" });

                            let game_condition = {
                                isDeleted: false,
                                season: "current"
                            }

                            let games = await commonQuery.findData(GAME, game_condition);
                            if (games.data.length > 0) {

                                for (var i = 0; i < games.data.length; i++) {


                                    if (games.data[i].gameState !== "open") {

                                        let condition_exist = {
                                            user: user._id,
                                            game: games.data[i]._id,
                                            isDeleted: false
                                        }
                                        let tipping_exist = await commonQuery.fetch_one(TIPPING, condition_exist)
                                        if (!tipping_exist) {

                                            let bettingTeam = "away";

                                            let tippingdata = {
                                                "user": user._id,
                                                "game": games.data[i]._id,
                                                "bettingTeam": bettingTeam,
                                            }
                                            let tippingData = await commonQuery.InsertIntoCollection(TIPPING, tippingdata)

                                        }


                                    }

                                }

                            }



                            let metadata = {
                                FIRST_NAME: user.firstname,
                                LAST_NAME: user.lastname,
                                EMAIL: user.email,
                            }
                            let user_email = []
                            user_email.push(user.email);
                            let SENT_MAIL_VALUE = await mails.send(Constant.VERIFICATION_USER_TEMPLATE_CODE, metadata, user_email)
                                // res.json({
                                //     code: Constant.SUCCESS_CODE,
                                //     message: Constant.EMAIL_VERIFIED
                                // });
                            return res.sendFile(__dirname + '/templates/emailVerificationSuccess.html');

                        }
                    });
                }
            });
        } catch (e) {
            // return res.json({
            //     code: Constant.ERROR_CODE,
            //     message: Constant.SOMETHING_WENT_WRONG
            // });
            return res.sendFile(__dirname + '/templates/emailVerificationFailed.html');

        }
    }
    asy_init();
}

/* Function is use to change password
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function changePassword(req, res) {
    async function asy_init() {
        try {
            if ((req.body.password)) {
                if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
                    return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
                }
                let condition = {
                    _id: req.body.userId
                }
                var user = await USER.findOne(condition);

                user.comparePassword(req.body.password, async function(err, isMatch) {
                    if (isMatch) {
                        if (user) {
                            user.password = req.body.new_password;
                            user.save(async function(err, userDetails) {
                                if (err) {
                                    // res.json({
                                    //     code: Constant.ERROR_CODE,
                                    //     data: null,
                                    //     message: Constant.USER_NOT_EXIST
                                    // })
                                    return mresponse(res, Constant.ERROR_CODE, Constant.USER_NOT_EXIST);

                                } else {
                                    // let metadata = {
                                    //     FIRST_NAME: userDetails.firstname,
                                    //     LAST_NAME: userDetails.lastname,
                                    //     EMAIL: userDetails.email,
                                    // }
                                    // let SENT_MAIL_VALUE = await mails.send(Constant.CHANGE_PASSWORD_CODE, metadata, userDetails.email)

                                    return mresponse(res, Constant.SUCCESS_CODE, Constant.PASSWORD_CHANGE);

                                }
                            });
                        }
                    } else {
                        return mresponse(res, Constant.ERROR_CODE, Constant.PASSWORD_ERROR);

                    }
                })
            }
        } catch (error) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_init()
}


function addUser(req, res) {
    async function asy_add_user() {
        try {
            var password = req.body.password;
            let role_cond = {
                rolename: 'user'
            }
            let roleData = await commonQuery.fetch_one(ROLE, role_cond)
            let role_id = roleData.id
            var tokenn;
            crypto.randomBytes(20, await
                function(err, buf) {
                    tokenn = buf.toString('hex');
                });
            try {
                if (req.body.email && req.body.password) {
                    let condition_exist = {
                        email: req.body.email
                    }
                    let customer_exist = await commonQuery.fetch_one(USER, condition_exist)
                    if (customer_exist) {
                        return response(res, Constant.ALLREADY_EXIST, Constant.EMAIL_ALREADY_REGISTERED);
                    } else {
                        // console.log("elsepart-----------------")
                        if (req.files != null) {
                            let file_name = req.files.file.name;
                            let str = file_name.split(".");
                            if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "jpeg") {
                                var orignalProfileName = 'profile_' + utility.generateRandomString() + '.' + str[1];
                                let profilePath = Constant.PROFILE_IMG_PATH + orignalProfileName;
                                //upload image
                                fs.writeFile(profilePath, (req.files.file.data), function(data, err) {
                                    if (err) throw err;
                                })
                            }
                        }
                        let username = validate.extractNameFromEmail(req.body.email);
                        let registerdata = {
                                username: username,
                                firstname: req.body.firstname || '',
                                lastname: req.body.lastname || '',
                                profilePhoto: orignalProfileName || '',
                                name: req.body.name,
                                email: req.body.email,
                                password: password,
                                role: role_id,
                                joinedDate: utility.removeOffset(new Date())
                            }
                            // console.log("register data", registerdata)
                        let user = await commonQuery.InsertIntoCollection(USER, registerdata)
                        if (user) {
                            try {
                                var UserData = {
                                    verification_token: tokenn,
                                    // verificationExpires: Date.now() + 3600000, // 1 hour
                                }
                                USER.findOneAndUpdate({
                                    _id: user._id
                                }, {
                                    $set: UserData
                                }, function(err, userDataa) {

                                })
                                let metadata = {
                                    // USER_NAME:user.username,
                                    FIRST_NAME: user.name,
                                    // LAST_NAME: user.lastname,
                                    EMAIL: user.email,
                                    ROLE: user.role,
                                    VERIFICATION_TOKEN: UserData.verification_token,
                                    API_URL: Config.baseUrl
                                }
                                let registereddata = {
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                }
                                let user_email = []
                                user_email.push(user.email)
                                let SENT_MAIL_VALUE = await mails.send(Constant.WELCOME_USER_TEMPLATE_CODE, metadata, user_email)
                                return response(res, Constant.SUCCESS_CODE, Constant.NEW_USER_SAVE_SUCCESS, registereddata);
                            } catch (err) {
                                return response(res, Constant.ERROR_CODE, err);
                            }
                        }
                    }
                } else {
                    return res.json({
                        code: Constant.ERROR_CODE,
                        message: Constant.NOT_PROPER_DATA
                    });
                }
            } catch (err) {
                return response(res, Constant.ERROR_CODE, err);
            };
        } catch (err) { return response(res, Constant.ERROR_CODE, err); }
    }
    asy_add_user();
}


/* Function is use to delete user record
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function deleteUser(req, res) {
    try {
        let userId = req.body.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        commonQuery.updateOneDocument(USER, {
            _id: userId
        }, {
            isDeleted: true
        }).then(function(response) {
            return res.json({
                code: Constant.SUCCESS_CODE,
                data: {},
                message: Constant.DELETE_USER_SUCCESS,
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


function deleteUsers(req, res) {
    try {
        for (let i = 0; i < req.body.users.length; i++) {
            commonQuery.updateOneDocument(USER, {
                _id: userId
            }, {
                isDeleted: true
            })
        }
        return res.json({
            code: Constant.SUCCESS_CODE,
            data: {},
            message: Constant.DELETE_USER_SUCCESS,
        });


    } catch (err) {
        return res.json({
            code: Constant.REQ_DATA_ERROR_CODE,
            message: Constant.SOMETHING_WENT_WRONG
        });
    }
}

/* Function is use to update user details
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateUser(req, res) {
    async function asy_initUpdate() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                name: req.body.name,
                age: req.body.age,
                email: req.body.email
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return res.json({
                    code: Constant.SUCCESS_CODE,
                    data: {},
                    message: Constant.USER_UPDATED_SUCCESS,
                });

            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.USER_UPDATED_UNSUCCESS
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


function userLogout(req, res) {
    async function asy_init() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let obj_update = {
                deviceToken: "",
                deviceType: ""
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.USER_UPDATED_SUCCESS);


            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.USER_UPDATED_UNSUCCESS);

            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_init();
}

/* Function is use to fetch user detail based on User Id
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function getUserDetails(req, res) {
    async function asy_init() {
        try {

            if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let condition = {
                _id: req.body.userId
            }
            let userDetail = USER.findOne(condition);
            if (userDetail) {
                userDetail.populate({
                    path: 'role',
                    select: 'rolename',
                }).populate({
                    path: 'favSport',
                    select: 'sportname',
                }).lean().exec(function(err, Userdetail) {
                    if (err) {
                        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
                    }

                    return mresponse(res, Constant.SUCCESS_CODE, Constant.DATA_FETCHED, Userdetail);
                })
            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.DATA_NOT_FOUND);
            }



        } catch (e) {

            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    asy_init();
}

function updateFavCompetition(req, res) {
    async function asy_initUpdate() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let obj_update = {
                favCompetition: req.body.compId
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.USER_UPDATED_SUCCESS);


            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.USER_UPDATED_UNSUCCESS);

            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}

function updateFavSport(req, res) {
    async function asy_initUpdate() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let obj_update = {
                favSport: req.body.sportId
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.USER_UPDATED_SUCCESS);


            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.USER_UPDATED_UNSUCCESS);

            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}

function updateName(req, res) {
    async function asy_initUpdate() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let obj_update = {
                name: req.body.name
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.USER_UPDATED_SUCCESS);


            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.USER_UPDATED_UNSUCCESS);

            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}

function updateKingBotNotification(req, res) {
    async function asy_initUpdate() {
        try {
            let userId = req.body.userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let obj_update = {
                isKingBotNotification: req.body.isKingBotNotification
            }
            let updateCondition = {
                _id: userId
            };
            let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
            if (userData) {
                return mresponse(res, Constant.SUCCESS_CODE, Constant.USER_UPDATED_SUCCESS);


            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.USER_UPDATED_UNSUCCESS);

            }
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}

/* Function is use to update user Profile Pic
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function updateProfilePic(req, res) {
    async function update_pic() {
        try {
            let file_name = req.files.file.name;
            let str = file_name.split(".");
            if (str[1].toLowerCase() == "png" || str[1].toLowerCase() == "JPG" || str[1].toLowerCase() == "jpeg" || str[1].toLowerCase() == "jpg" || str[1].toLowerCase() == "webp") {
                let orignalProfileName = 'profile_' + utility.generateRandomString() + '.' + str[1];
                let profilePath = Constant.PROFILE_IMG_PATH + orignalProfileName;
                //upload image
                fs.writeFile(profilePath, (req.files.file.data), function(data, err) {
                        if (err) throw err;
                    })
                    //save image in db
                let condition = {
                    _id: req.body.userId
                }
                let userdata = await commonQuery.findoneData(USER, condition);
                if (userdata) {
                    console.log("userdata: " + JSON.stringify(userdata));
                    let profilepic_path = {
                        profilePhoto: orignalProfileName,
                    }
                    let updateCondition = {
                        _id: userdata._id
                    };
                    let userProfileData = await commonQuery.updateOneDocument(USER, updateCondition, profilepic_path)
                    if (userProfileData) {
                        return mresponse(res, Constant.SUCCESS_CODE, Constant.UPLOAD_SAVED, userProfileData);
                    } else {
                        return mresponse(res, Constant.ERROR_CODE, Constant.UPLOAD_FAILED, userProfileData);
                    }
                }
            } else {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }

        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);
        }
    }
    update_pic()
}

/* Function is use to Deactivate user
 * @access private
 * @return json
 * Created by Trisha Deepam
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */

function deActivateUser(req, res) {
    async function user_status() {
        try {
            let userId = req.body.userId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let condition_exist = {
                _id: req.body.userId
            }
            let userData = await commonQuery.fetch_one(USER, condition_exist)
            if (userData) {
                let obj_update = {
                    isActive: !userData.isActive
                }
                let updateCondition = {
                    _id: userData._id
                };
                let status_change = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
                return response(res, Constant.SUCCESS_CODE, Constant.STATUS_CHANGE, status_change);
            }

            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        };

    }
    user_status();
}

/* Function is use to fetch user detail 
 * @access private
 * @return json
 * Created by 
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function getAuthDetails(req, res) {
    async function asy_init() {
        try {
            if (req.user.email) {
                let condition = {
                    email: req.user.email,
                    isDeleted: false
                }
                var user = await commonQuery.findoneData(USER, condition);

                if (user) {
                    let params = {
                        id: user._id,
                        email: user.email
                    };
                    let jwtToken = jwt.sign(params, Config.SECRET, {
                        expiresIn: 60 * 60 * 168 * 1 // expiration duration 8 Hours
                    });
                    let rolename = "";
                    let role_cond = {
                        _id: user.role
                    }
                    await commonQuery.findoneData(ROLE, role_cond).then(async roleData => {
                        rolename = roleData.rolename
                    })
                    if (validator.isValid(jwtToken)) {
                        let userdata = {}
                        userdata.firstname = user.firstname,
                            userdata.lastname = user.lastname,
                            userdata.email = user.email,
                            userdata.role = rolename,
                            userdata.device_id = req.body.device_id,
                            userdata.device_token = req.body.device_token,
                            userdata.device_type = req.body.device_type,
                            userdata.signup_type = user.signup_type,
                            userdata.profilePic = user.profilePhoto,
                            userdata.userId = user._id,
                            userdata.address = user.address,
                            userdata.token = 'Bearer ' + jwtToken
                        return response(res, Constant.SUCCESS_CODE, Constant.SIGNIN_SUCCESS, userdata);
                    } else {
                        return response(res, Constant.ERROR_CODE, Constant.INVALID_TOKEN);
                    }

                }
            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.LOGIN_REQUIRED_FIELDS
                });
            }
        } catch (e) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.SOMETHING_WENT_WRONG
            });
        }
    }
    asy_init();
}

/* Function is use to get email verification link
 * @access private
 * @return json
 * Created by Trisha
 * @smartData Enterprises (I) Ltd
 * Created Date 
 */
function getEmailVerificationLink(req, res) {
    async function asy_verify() {
        try {
            if (req.body.email) {
                let condition_exist = {
                    email: req.body.email
                }
                let customer_exist = await commonQuery.fetch_one(USER, condition_exist)
                if (customer_exist) {
                    let user = customer_exist;
                    if (user) {
                        let metadata = {
                            FIRST_NAME: user.firstname,
                            LAST_NAME: user.lastname,
                            EMAIL: user.email,
                            ROLE: user.role,
                            VERIFICATION_TOKEN: user.verification_token,
                            API_URL: Config.baseUrl
                        }
                        let SENT_MAIL_VALUE = await mails.send(Constant.WELCOME_USER_TEMPLATE_CODE, metadata, user.email)
                        return response(res, Constant.SUCCESS_CODE, Constant.SENT_VERIFICATION_LINK);
                    }
                } else {
                    return response(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);

                }
            } else {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }

        } catch (err) { return response(res, Constant.ERROR_CODE, err); }
    }
    asy_verify();
}

function sendMessage(req, res) {
    async function asy_initUpdate() {
        try {
            let messageTitle = req.body.messageTitle;
            let messageDescription = req.body.messageDescription;
            let users = req.body.users;
            for (let i = 0; i < users.length; i++) {
                let user = await USER.findOne({ _id: users[i] });

                var message = {
                    to: user.deviceToken,
                    collapse_key: 'your_collapse_key',

                    notification: {
                        title: messageTitle,
                        body: messageDescription
                    }
                };

                fcm.send(message, function(err, response) {
                    if (err) {
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });

            }
            return mresponse(res, Constant.SUCCESS_CODE, Constant.SEND_MESSAGE_SUCCESS);
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}


function inviteUsers(req, res) {
    async function asy_initUpdate() {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.userId) || !mongoose.Types.ObjectId.isValid(req.body.compId)) {
                return mresponse(res, Constant.ERROR_CODE, Constant.NOT_PROPER_DATA);
            }
            let userId = req.body.userId;
            let compId = req.body.compId;
            let users = req.body.users;
            let comp = await COMP.findOne({ _id: compId });
            for (let i = 0; i < users.length; i++) {

                if (comp.isPublic) {
                    let metadata = {
                        COMP_NAME: comp.competitionname,
                    }
                    let user_email = []
                    user_email.push(users[i])
                    let SENT_MAIL_VALUE = await mails.send(Constant.INVITE_COMP_TEMPLATE_CODE_PUBLIC, metadata, user_email);
                } else {
                    let metadata = {
                        COMP_NAME: comp.competitionname,
                        PASSWORD: comp.password,
                    }
                    let user_email = []
                    user_email.push(users[i])
                    let SENT_MAIL_VALUE = await mails.send(Constant.INVITE_COMP_TEMPLATE_CODE_PRIVATE, metadata, user_email);
                }




            }
            return mresponse(res, Constant.SUCCESS_CODE, Constant.INVITE_SUCCESS);
        } catch (err) {
            return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG);

        }
    }
    asy_initUpdate();
}

function verifiedAccount(req, res) {
    async function verified_account() {
        try {
            let userId = req.body.userId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.json({
                    code: Constant.ERROR_CODE,
                    message: Constant.NOT_PROPER_DATA
                });
            }
            let condition_exist = {
                _id: req.body.userId
            }
            let userData = await commonQuery.fetch_one(USER, condition_exist)
            if (userData) {
                let obj_update = {
                    isVerified: !userData.isVerified
                }
                let updateCondition = {
                    _id: userData._id
                };
                let status_change = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
                return response(res, Constant.SUCCESS_CODE, Constant.EMAIL_VERIFIED, status_change);
            }

            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        } catch (err) {
            return response(res, Constant.ERROR_CODE, Constant.ERROR_OCCURED, err);
        };

    }
    verified_account();
}

async function addUserSports(req, res) {

    console.log("addUserSports");

    try {
        let userId = req.body.userId;
        console.log("Sport ID : " + req.body.sportId)
        console.log("userId issss:  ", userId);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.NOT_PROPER_DATA
            });
        }
        const list = req.body.sportId;
        const data = [];
        data.push(list)


        console.log("data isssssss", list);
        let obj_update = {
            "sport": list
        }
        let updateCondition = {
            _id: userId
        }
        console.log("obj_update : " + JSON.stringify(obj_update));
        console.log("updateCondition : " + JSON.stringify(updateCondition));

        let userData = await commonQuery.updateOneDocument(USER, updateCondition, obj_update)
        console.log(userData);


        // let user_exist = await commonQuery.fatch_one(USERSPORTS, userSportData)
        // console.log("users  existttttt", user_exist);
        // if (user_exist) {
        //     let update = {

        //     }
        //     let dataa = {
        //         "sport": list
        //     }
        //     let updateUserSport = await commonQuery.updateOneDocument(USERSPORTS, update, dataa)
        //     console.log("updateUserSports", updateUserSport);
        // } else {
        //     let final = {
        //         "user": req.body.userId,
        //         "sport": list
        //     }
        //     let userSports = await commonQuery.InsertIntoCollection(USERSPORTS, final)
        //     console.log("userSports issssssss", userSports);
        // }
        //  let userSports = await commonQuery.InsertIntoCollection(USERSPORTS, final)
        //     console.log("userSports issssssss", userSports);




        // console.log(userSportData);
        // let userSports = await commonQuery.InsertIntoCollection(USERSPORTS, userSportData)
        // console.log("userSports issssssss", userSports);
        // if (userSports) {
        //     return res.json({
        //         code: Constant.SUCCESS_CODE,
        //         data: userSports

        //     })
        // }

        let condition = { isDeleted: false }
        let totalCount = await commonQuery.countData(SPORT, condition);



        console.log("totalCount", totalCount);


        if (userData) {

            return res.json({
                code: Constant.SUCCESS_CODE,
                data: userData,
                message: Constant.ADD_SPORT_SUCCESSFULLY
            })


        } else {
            return res.json({
                code: Constant.ERROR_CODE,
                message: Constant.USER_UPDATED_UNSUCCESS,
                error
            })
        }
    } catch (err) {
        return mresponse(res, Constant.ERROR_CODE, Constant.SOMETHING_WENT_WRONG)
    }

}