import { Server } from 'socket.io';
import * as chatModel from './models/messageModel'
import { v4 as uuidv4 } from 'uuid';
import * as chatWithModel from './models/chatWithModel';

export class SocketIoServer {
  // Store active users: { userId: socket.id }
  onlineUsers: {[userid: string]: string} = {};
  io: Server;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      }
    });
  }

  startChatServer() {
    this.io.on('connection', (socket) => {
      console.log('⭕ User connected:', socket.id);
    
      // Register user
      socket.on('register', (userId) => {
        this.onlineUsers[userId] = socket.id;
      });
    
      // Receive and forward message
      socket.on('send message', async(msg) => {
        const { id, from_user_id, to_user_id, content, created_at } = msg;
    
        // save to MySQL
        const messageId = uuidv4();
        chatModel.insertMessage(messageId, from_user_id, to_user_id, content);
        if (!await chatWithModel.isExists(from_user_id, to_user_id))
          await chatWithModel.insert(from_user_id, to_user_id);
        await chatWithModel.updateLastChat(from_user_id, to_user_id);
    
        // Send to target user if online
        const targetSocketId = this.onlineUsers[to_user_id];
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('receive message', {
            messageId, from_user_id, to_user_id, content, created_at
          });
        }
      });
    
      socket.on('disconnect', () => {
        // Remove user from online list
        for (const userId in this.onlineUsers) {
          if (this.onlineUsers[userId] === socket.id) {
            delete this.onlineUsers[userId];
            break;
          }
        }
        console.log('❌ User disconnected:', socket.id);
      });
    });

    console.log('💬 Chat server on!!');
  }
}