'use strict';

const config = {

    local: {
        host: 'localhost:',
        port: 3020,
        baseUrl: 'http://localhost:3019/',
        SECRET: 'crm@$12&*01',
        fcmServerKey: 'AAAAicrzFTw:APA91bEUK3v83-H8U0QCDw4ILrazRaYlWZ4n4MCjJpRTCfHOmWuTi4MvfW-zE4duq9SfdKumMRxkh-FBaSOBaHi7sZ71_FhPMkeyVGptmFgxNEllFjQPRgVvfY0FQQRu6zPUKBLGZvgD',
        // DATABASE: {
        //     dbname: 'rugbytipping',
        //     host: 'mongodb://localhost:',
        //     port: 58173,
        //     username: 'rugbytipping',
        //     password: 'rugbytipping2780'
        // },
        DATABASE: {
            dbname: 'rugbytipping',
            host: 'mongodb://localhost:',
            port: 27017,
            username: 'rugbytipping',
            password: 'rugbytipping2780'
        },
        SMTP: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            secure: true,
            port: 465,
            fromEmail: '',
            authUser: '',
            authpass: ''
        }

    },
    staging: {
        host: 'localhost:',
        port: 3020,
        baseUrl: 'http://localhost:3019/',
        SECRET: 'crm@$12&*01',
        fcmServerKey: 'AAAAicrzFTw:APA91bEUK3v83-H8U0QCDw4ILrazRaYlWZ4n4MCjJpRTCfHOmWuTi4MvfW-zE4duq9SfdKumMRxkh-FBaSOBaHi7sZ71_FhPMkeyVGptmFgxNEllFjQPRgVvfY0FQQRu6zPUKBLGZvgD',
        DATABASE: {
            dbname: '',
            host: 'mongodb://localhost:',
            port: 58173,
            username: '',
            password: ''
        },
        // DATABASE: {
        //     dbname: '',
        //     host: 'mongodb://localhost:',
        //     port: 27017,
        //     username: '',
        //     password: ''
        // },
        SMTP: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            secure: true,
            port: 465,
            fromEmail: '',
            authUser: '',
            authpass: ''
        }
    },
    live: {
        host: 'toptippers.com:',
        port: 3020,
        baseUrl: 'http://localhost.com:3019/',
        SECRET: 'crm@$12&*01',
        fcmServerKey: 'AAAAicrzFTw:APA91bEUK3v83-H8U0QCDw4ILrazRaYlWZ4n4MCjJpRTCfHOmWuTi4MvfW-zE4duq9SfdKumMRxkh-FBaSOBaHi7sZ71_FhPMkeyVGptmFgxNEllFjQPRgVvfY0FQQRu6zPUKBLGZvgD',
        DATABASE: {
            dbname: 'rugbytipping',
            host: 'mongodb://127.0.0.1:',
            port: 27017,
            username: '',
            password: ''
        },
        // DATABASE: {
        //     dbname: 'rugbytipping',
        //     host: 'mongodb://localhost:',
        //     port: 58173,
        //     username: '',
        //     password: ''
        // },
        SMTP: {
            service: 'email-smtp.us-east-2.amazonaws.com',
            host: 'email-smtp.us-east-2.amazonaws.com',
            secure: true,
            port: 465,
            fromEmail: '',
            authUser: '',
            authpass: ''
        }

    }
};
module.exports.get = function get(env) {
    return config[env] || config.default;
}