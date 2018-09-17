import { Server, Socket } from 'socket.io';
import { Room, Host } from './room';
import { Util } from './util';
import { RoomEvent } from './events';

export class RtcConnector {
    private rooms: Map<string, Room> = new Map<string, Room>();
    private roomNames: string[] = [];

    constructor(roomNames: string[]){
        this.roomNames = Util.shuffle(roomNames);
    } 

    public setupNewSocket(socket: Socket): void {
        socket.on(RoomEvent.Create, (offer: string) => this.createRoom(socket, offer));
        socket.on(RoomEvent.Join, (room: string) => this.joinRoom(socket, room));
        socket.on(RoomEvent.Disconnect, (room: string) => this.disconnect(socket));
        socket.on(RoomEvent.OfferGenerated, (room: string, offer: string) => this.offerGenerated(room, offer));
        socket.on(RoomEvent.Connect, (socket: Socket) => {
            console.log('connected: '+socket.id);            
        });
    }
    private createRoom(socket: Socket, offer: any): void {
        console.log('Request to create room');
        const host = new Host(socket, JSON.stringify(offer));
        console.log(host);
        const name = this.roomNames.pop();
        const room = new Room(name, host);
        this.rooms.set(room.name, room);
        console.log('created room: ', room.name);
        socket.emit(RoomEvent.RoomCreated, room.name);
    }

    private joinRoom(socket: Socket, roomName: string): void {
        console.log('rooms: ', this.rooms);
        console.log('Request to join room: ', roomName);
        if (!this.rooms.has(roomName)) {
            socket.emit(RoomEvent.RoomDoesNotExist);
            console.log('room does not exist');
            return;
        }
        
        const room = this.rooms.get(roomName);
        console.log('sending host information');
        console.log(room.host.offer);
        socket.emit(RoomEvent.JoinedRoom, room.host.offer);
    }

    private offerGenerated(roomName: string, offer: string): void {
        console.log('received offer: ', offer);
        const room = this.rooms.get(roomName);
        console.log('sending offer to :',room.host.socket.id);
        room.host.socket.emit(RoomEvent.PlayerJoined, offer)
    }

    private disconnect(socket: Socket): void {
        console.log('Someone disconnected: ', socket.id);
        const roomByHost = Array.from(this.rooms.values()).find((room) => {
            return room.host.socket.id === socket.id;
        });

        if (!roomByHost) {
            console.log('a nobody disconnected');
            return;
        }
        console.log('the host disconnected');
        this.rooms.delete(roomByHost.name);
        this.roomNames.push(roomByHost.name);
    }

    
}