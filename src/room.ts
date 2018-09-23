import { Socket } from "socket.io";

export class Room {
    public players: Map<string,Socket>;

    constructor(public host: Socket, public name: string) {
        this.players = new Map<string, Socket>();
    }
}