import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import errorHandler = require('errorhandler');
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as fileUpload from 'express-fileupload';
import * as helmet from 'helmet';

import { AudioRoute } from './routes/AudioRoute';
import { TalkRoute } from './routes/TalkRoute';

const debug = require('debug')('main');

const config = require('./config/config');

export class Server {
    public app: express.Application;

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

    public static bootstrap(): Server {
        return new Server();
    }

    public static api() {
        return true;
    }

    public config() {
        // add static paths
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(express.static(path.join(__dirname, '../static')));

        // mount logger
        this.app.use(logger(config.morgan.level || 'dev'));

        // mount json form parser
        this.app.use(bodyParser.json());

        // mount query string parser
        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );

        this.app.use(bodyParser.raw());

        //mount cookie parker
        this.app.use(cookieParser());

        this.app.use(fileUpload());

        // helmet
        this.app.use(helmet());

        // use bluebird promises
        global.Promise = require('bluebird');
        global['debug'] = debug;

        // catch 404 and forward to error handler
        this.app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
            err.status = 404;
            next(err);
        });

        // error handling
        this.app.use(errorHandler());
    }

    private initConnections() {

    }

    private models() {
        global['Bluebird'] = require('bluebird');
    }

    private routes() {
        const nonAuthRouter = express.Router();
        AudioRoute.create(nonAuthRouter);
        TalkRoute.create(nonAuthRouter);

        // use router middleware
        this.app.use(nonAuthRouter);
    }
}
