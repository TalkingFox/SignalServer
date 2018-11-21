import { Server, Socket } from 'socket.io';
import { Room } from './room';
import { Util } from './util';
import { RoomEvent } from './events';
import { JoinRequest } from './joinRequest';
import { PlayerAccepted } from './playerAccepted';

export class RtcConnector {
    private rooms: Map<string, Room> = new Map<string, Room>();
    private roomNames: string[] = [];

    constructor(roomNames: string[]){
        this.roomNames = Util.shuffle(roomNames);
    } 

    public setupNewSocket(socket: Socket): void {
        socket.on(RoomEvent.Create, (offer: string) => this.createRoom(socket, offer));
        socket.on(RoomEvent.Join, (request: string) => {console.log(request);this.joinRoom(socket, JSON.parse(request))});
        socket.on(RoomEvent.Disconnect, (room: string) => this.disconnect(socket));
        socket.on(RoomEvent.PlayerAccepted, (acceptance: string) => this.playerAccepted(JSON.parse(acceptance)));
        socket.on(RoomEvent.Connect, (socket: Socket) => {
            console.log('connected: '+socket.id);            
        });
    }
    private createRoom(socket: Socket, offer: any): void {
        console.log('received create room request');
        const name = this.roomNames.pop();
        const room = new Room(socket, name);
        this.rooms.set(room.name, room);
        console.log('added room: ',room.name);
        socket.emit(RoomEvent.RoomCreated, room.name);
    }

    private joinRoom(socket: Socket, request: JoinRequest): void {
        if (!this.rooms.has(request.room)) {
            socket.emit(RoomEvent.RoomDoesNotExist);
            console.log('room does not exist: ', request.room);
            return;
        }
        
        console.log('received join request');
        const room = this.rooms.get(request.room);
        if (room.players.has(request.player)) {
            socket.emit(RoomEvent.PlayerNameTaken);
            return;
        }

        room.players.set(request.player, socket);
        room.host.emit(RoomEvent.PlayerJoined, JSON.stringify(request));
    }

    private playerAccepted(acceptance: PlayerAccepted): void {
        const room = this.rooms.get(acceptance.room);
        console.log('player accepted: ', acceptance.player);
        const player = room.players.get(acceptance.player);
        player.emit(RoomEvent.PlayerAccepted, acceptance.hostOffer);
    }

    private disconnect(socket: Socket): void {
        const roomByHost = Array.from(this.rooms.values()).find((room) => {
            return room.host.id === socket.id;
        });

        if (!roomByHost) {
            return;
        }
        this.rooms.delete(roomByHost.name);
        this.roomNames.unshift(roomByHost.name);
    }

    
}