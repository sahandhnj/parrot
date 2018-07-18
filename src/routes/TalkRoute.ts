import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

import { InteractionService } from '../services/InteractionService';
const repeatFile = 'static/talkback.wav';

export class TalkRoute {
    constructor() {
    }

    public static create(router: Router) {
        router.post('/repeat', async (req: Request, res: Response, next: NextFunction) => {
            if(req.body.text){
                await InteractionService.speak(req.body.text, repeatFile);
                return res.send();
            }

            res.sendStatus(400);
            return res.send();
        });
    }
}
