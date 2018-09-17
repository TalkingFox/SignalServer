import { App } from "./app";
import { Socket } from 'socket.io'
import * as socketIo from 'socket.io';
import { RtcConnector } from "./rtcConnector";

const port = 8080;

const app: App = new App();
const server = app.listen(port, () => {
    console.log('listening');
});

const socket = socketIo(server, {origins: '*:*'});
const connector = new RtcConnector(app.getAllWords())
socket.on('connection', (socket: Socket) => {    
    console.log('connection: '+socket.id);
    connector.setupNewSocket(socket);
})