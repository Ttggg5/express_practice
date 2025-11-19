"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIoServer = void 0;
const socket_io_1 = require("socket.io");
const chatModel = __importStar(require("./models/messageModel"));
const uuid_1 = require("uuid");
const chatWithModel = __importStar(require("./models/chatWithModel"));
const notificationQueue_1 = require("./notificationQueue");
class SocketIoServer {
    constructor(httpServer) {
        // Store active users: { userId: socket.id }
        this.onlineUsers = {};
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: true,
                credentials: true,
            }
        });
    }
    startServer() {
        this.io.on('connection', (socket) => {
            // Register user
            socket.on('register', (userId) => {
                this.onlineUsers[userId] = socket.id;
                console.log(`⭕ User connected: ${userId}[${socket.id}]`);
            });
            // ---------------------------------For Chat----------------------------------
            // Receive and forward message
            socket.on('send-message', async (msg) => {
                const { id, from_user_id, to_user_id, content, created_at } = msg;
                // Save to database
                const messageId = (0, uuid_1.v4)();
                chatModel.insertMessage(messageId, from_user_id, to_user_id, content);
                if (!await chatWithModel.isExists(from_user_id, to_user_id))
                    await chatWithModel.insert(from_user_id, to_user_id);
                await chatWithModel.updateLastChat(from_user_id, to_user_id);
                await chatWithModel.updateRead(from_user_id, to_user_id, false);
                // Send to target user if online
                const targetSocketId = this.onlineUsers[to_user_id];
                if (targetSocketId) {
                    this.io.to(targetSocketId).emit('receive-message', {
                        messageId, from_user_id, to_user_id, content, created_at
                    });
                    this.io.to(targetSocketId).emit('message-noti', { from_user_id });
                }
            });
            socket.on('disconnect', () => {
                // Remove user from online list
                for (const userId in this.onlineUsers) {
                    if (this.onlineUsers[userId] === socket.id) {
                        delete this.onlineUsers[userId];
                        console.log(`❌ User disconnected: ${userId}[${socket.id}]`);
                        break;
                    }
                }
            });
            // ---------------------------------------------------------------------------
            // ------------------------------For Notification-----------------------------
            setInterval(() => {
                while (notificationQueue_1.NotificationQueue.queue.length > 0) {
                    const noti = notificationQueue_1.NotificationQueue.dequeue();
                    this.io.to(this.onlineUsers[noti?.user_id]).emit('notification', noti);
                }
            }, 5000);
        });
        // -----------------------------------------------------------------------------
        console.log('Socket server on!!');
    }
}
exports.SocketIoServer = SocketIoServer;
