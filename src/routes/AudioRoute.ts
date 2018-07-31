import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

import { AudioPipline } from '../services/AudioPipline';
import { DataBaseService } from '../services/DataBaseService';
import { NLPService } from '../services/NLPService';

export class AudioRoute {
    constructor() {
    }

    public static create(router: Router) {
        router.post('/talk', (req: Request, res: Response, next: NextFunction) => {
            AudioPipline.pipeIt(res, req);
        });

        router.get('/list', (req: Request, res: Response, next: NextFunction) => {
            DataBaseService.select(res);
        });

        router.post('/test', (req: Request, res: Response, next: NextFunction) => {
            NLPService.parse(req.body.text);
            return res.send();
        })
    }
}
