"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueue = void 0;
class NotificationQueue {
    static enqueue(item) {
        this.queue.push(item);
    }
    static dequeue() {
        return this.queue.shift();
    }
}
exports.NotificationQueue = NotificationQueue;
NotificationQueue.queue = [];
