import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

import { AudioPipline } from '../services/AudioPipline';

export class AudioRoute {
    constructor() {
    }

    public static create(router: Router) {
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.sendFile(path.join(__dirname + '/public/index.html'));
        });

        router.post('/talk', (req: Request, res: Response, next: NextFunction) => {
            AudioPipline.pipeIt(res, req);
        });
    }
}
