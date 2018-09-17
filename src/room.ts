import { Socket } from "socket.io";

export class Room {
    constructor(public name: string, public host: Host) {
    }
}

export class Host {
    constructor(public socket: Socket, public offer: string){}
}