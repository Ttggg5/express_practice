import { Notification } from './models/notificationsModel'

export class NotificationQueue {
	static queue: Notification[] = [];

	static enqueue(item: Notification) {
		this.queue.push(item);
	}

	static dequeue() {
		return this.queue.shift();
	}
}