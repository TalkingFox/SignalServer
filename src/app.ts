import {Request, Response, Application} from 'express';
import * as express from 'express';
import { readFileSync } from 'fs';

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.configureRouting();
    }

    public listen(port: number, callback: Function) {
        return this.app.listen(port, callback);
    }

    public getAllWords(): string[] {
        const content = readFileSync('words.json');
        return JSON.parse(content.toString());
    }

    private configureRouting(): void {
        const router = express.Router();
        
        router.get('/', (request: Request, response: Response) => {
            response.status(200).send({
                message: 'ok'
            });
        });

        this.app.use(router);
    }
}