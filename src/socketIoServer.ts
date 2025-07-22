import { Server } from 'socket.io';
import * as chatModel from './models/messageModel'
import { v4 as uuidv4 } from 'uuid';
import * as chatWithModel from './models/chatWithModel';
import { NotificationQueue } from './notificationQueue';

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

  startServer() {
    this.io.on('connection', (socket) => {
      // Register user
      socket.on('register', (userId) => {
        this.onlineUsers[userId] = socket.id;
        console.log(`⭕ User connected: ${userId}[${socket.id}]`);
      });
    
      // ---------------------------------For Chat----------------------------------
      // Receive and forward message
      socket.on('send-message', async(msg) => {
        const { id, from_user_id, to_user_id, content, created_at } = msg;
    
        // Save to database
        const messageId = uuidv4();
        chatModel.insertMessage(messageId, from_user_id, to_user_id, content);
        if (!await chatWithModel.isExists(from_user_id, to_user_id))
          await chatWithModel.insert(from_user_id, to_user_id);
        await chatWithModel.updateLastChat(from_user_id, to_user_id);
        await chatWithModel.updateRead(to_user_id, from_user_id, false);
    
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
        while (NotificationQueue.queue.length > 0) {
          const noti = NotificationQueue.dequeue();
          this.io.to(this.onlineUsers[noti?.user_id as string]).emit('notification', noti);
        }
      }, 5000);
    });
    // -----------------------------------------------------------------------------

    console.log('Socket server on!!');
  }
}