var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const request = require('request');
const cors = require('cors');




const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./app/swagger/swagger.json');


// require('custom-env').env('local')

var app = express();
app.use(cors());


app.use(fileUpload());

global.__rootRequire = function(relpath) {
    return require(path.join(__dirname, relpath));
};

if (!process.env.NODE_ENV || process.env.NODE_ENV == undefined) {
    process.env.NODE_ENV = 'staging';
}
const config = require('./app/config/config.js').get(process.env.NODE_ENV);
console.log("config------------", config.host + "" + config.port + "/apiDocs")
swaggerDocument.host = config.host + "" + config.port
    // console.log("Swaggerhost--------",swaggerDocument.host)
require('./app/config/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
}));

//For deployment of admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin/build')));
app.get('/admin*', function(req, res) {
    res.sendFile(path.join(__dirname + '/admin/build/index.html'));
});


// app.use('/app/uploads/uploadsprofilepic', express.static(path.join(__dirname, './app/uploads/profile'))),
app.use('/app/uploads', express.static(path.join(__dirname, '/app/uploads')));

// Image path
// http://localhost:5000/app/uploads/profile/profile_rbnEMx.png


// All api requests
app.use(function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization,multipart/form-data');

    if (req.method == 'OPTIONS' || (req.method == 'GET' && req.path.includes("/uploads"))) {
        res.status(200).end();
    } else {
        next();
        //res.status(200).end();
    }
});

app.use(bodyParser.json({
    limit: '50mb'
}));


app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', require('./app/api/routes')(express));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

//start server

// cron.schedule('*/1 * * * *', () => {
//     console.log("cron STARTED..........");
//     request({
//         uri: config.baseUrl + "api/game/updateTopTippersGamePoints",
//         qs: {},
//         function(error, response, body) {
//             if (!error && response.statusCode === 200) {
//                 //res.json(body);
//             } else {
//                 //res.json(error);
//             }
//         }
//     });
// });


var port = process.env.NODE_ENV.PORT || config.port;
var server = app.listen(port);
server.setTimeout(90000000);

module.exports = app;



// NODE_ENV=staging npm start