export enum Action{
  posted = 'posted',
  commented = 'commented'
}

export interface Notification {
  id: number;
  user_id: string;
  actor_id: string;
  verb: Action
  post_id: string;
  comment_id: string;
  is_read: boolean;
  created_at: Date;
}

