import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

import { AudioPipline } from '../services/AudioPipline';
import { DataBaseService } from '../services/DataBaseService';
import { NLPService } from '../services/NLPService';
import { Guru } from '../services/Guru';

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

        router.post('/test', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await NLPService.parse(req.body.text);
                return res.send({ result });
            } catch (e) {
                console.log(e);
                res.status(500);
                return res.send();
            }

        })

        router.post('/test2', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await Guru.do(req.body.text,req.body.phrase);
                return res.send({ result });
            } catch (e) {
                console.log(e);
                res.status(500);
                return res.send();
            }

        })

        router.post('/options', async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await Guru.getMeOptions(req.body.text);
                return res.send({ result });
            } catch (e) {
                console.log(e);
                res.status(500);
                return res.send();
            }

        })
    }
}
