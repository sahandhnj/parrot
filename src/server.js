(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "body-parser", "cookie-parser", "errorhandler", "express", "path", "morgan", "express-fileupload", "helmet", "./routes/AudioRoute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const bodyParser = require("body-parser");
    const cookieParser = require("cookie-parser");
    const errorHandler = require("errorhandler");
    const express = require("express");
    const path = require("path");
    const logger = require("morgan");
    const fileUpload = require("express-fileupload");
    const helmet = require("helmet");
    const AudioRoute_1 = require("./routes/AudioRoute");
    const debug = require('debug')('main');
    const config = require('./config/config');
    class Server {
        constructor() {
            // create expressjs application
            this.app = express();
            // configure application
            this.config();
            // database configuration
            this.initConnections();
            // export models
            this.models();
            // add routes
            this.routes();
            // add api
            Server.api();
        }
        static bootstrap() {
            return new Server();
        }
        static api() {
            return true;
        }
        config() {
            // add static paths
            this.app.use(express.static(path.join(__dirname, 'public')));
            this.app.use(express.static(path.join(__dirname, 'static')));
            // mount logger
            this.app.use(logger(config.morgan.level || 'dev'));
            // mount json form parser
            this.app.use(bodyParser.json());
            // mount query string parser
            this.app.use(bodyParser.urlencoded({
                extended: true,
            }));
            this.app.use(bodyParser.raw());
            // mount cookie parker
            this.app.use(cookieParser());
            this.app.use(fileUpload());
            // helmet
            this.app.use(helmet());
            // use bluebird promises
            global.Promise = require('bluebird');
            global['debug'] = debug;
            // catch 404 and forward to error handler
            this.app.use(function (err, req, res, next) {
                err.status = 404;
                next(err);
            });
            // error handling
            this.app.use(errorHandler());
        }
        initConnections() {
        }
        models() {
            global['Bluebird'] = require('bluebird');
        }
        routes() {
            const nonAuthRouter = express.Router();
            AudioRoute_1.AudioRoute.create(nonAuthRouter);
            // use router middleware
            console.log('Setting Routes');
            this.app.use(nonAuthRouter);
        }
    }
    exports.Server = Server;
});
