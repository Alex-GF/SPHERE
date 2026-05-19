import container from '../config/container';
import NotificationService from '../services/NotificationService';
import { handleError } from '../utils/users/helpers';

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = container.resolve('notificationService');
    this.getNotifications = this.getNotifications.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
  }

  async getNotifications(req: any, res: any) {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unreadOnly === 'true';
      const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

      const notifications = await this.notificationService.getNotifications(userId, { unreadOnly, offset, limit });
      res.json(notifications);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getUnreadCount(req: any, res: any) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async markAsRead(req: any, res: any) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;
      const result = await this.notificationService.markAsRead(notificationId, userId);
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async markAllAsRead(req: any, res: any) {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.markAllAsRead(userId);
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async deleteNotification(req: any, res: any) {
    try {
      const { notificationId } = req.params;
      const result = await this.notificationService.deleteNotification(notificationId);
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }
}

export default NotificationController;
