"use client";

import { io, Socket } from "socket.io-client";

class WebSocket {
    static instance: Socket;

    static init(): Socket {
        if (!WebSocket.instance) {
            WebSocket.instance = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
                withCredentials: true,
                reconnection: true,
            });
        }
        return WebSocket.instance;
    }

    static getInstance(): Socket {
        return WebSocket.init();
    }

    static emit<T>(event: string, data?: T):void {
        WebSocket.instance.emit(event, data);
    }

    static on<T>(event: string, callback: (data: T) => void): void {
        WebSocket.instance.on(event, callback);
    }

    static off(event: string): void {
        WebSocket.instance.off(event);
    }

    static close(): void {
        WebSocket.instance.close();
    }

}

export default WebSocket;