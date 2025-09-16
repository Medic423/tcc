import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();
const prisma = databaseManager.getPrismaClient();

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Get notifications request for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get notifications from system analytics
    const notifications = await prisma.systemAnalytics.findMany({
      where: {
        metricName: 'notification',
        userId: userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Limit to last 50 notifications
    });

    // Transform notifications
    const transformedNotifications = notifications.map(notif => ({
      id: notif.id,
      type: (notif.metricValue as any)?.type || 'info',
      title: (notif.metricValue as any)?.title || 'Notification',
      message: (notif.metricValue as any)?.message || '',
      read: (notif.metricValue as any)?.read || false,
      createdAt: notif.timestamp
    }));

    res.json({
      success: true,
      data: transformedNotifications
    });

  } catch (error) {
    console.error('TCC_DEBUG: Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Mark notification as read:', req.params.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { id } = req.params;

    // Update notification read status
    const notification = await prisma.systemAnalytics.findFirst({
      where: {
        id: id,
        userId: userId,
        metricName: 'notification'
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    const updatedValue = {
      ...(notification.metricValue as any),
      read: true,
      readAt: new Date().toISOString()
    };

    await prisma.systemAnalytics.update({
      where: { id: id },
      data: {
        metricValue: updatedValue
      }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('TCC_DEBUG: Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.put('/read-all', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Mark all notifications as read for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get all unread notifications for the user
    const notifications = await prisma.systemAnalytics.findMany({
      where: {
        metricName: 'notification',
        userId: userId
      }
    });

    // Update all notifications to read
    for (const notification of notifications) {
      const updatedValue = {
        ...(notification.metricValue as any),
        read: true,
        readAt: new Date().toISOString()
      };

      await prisma.systemAnalytics.update({
        where: { id: notification.id },
        data: {
          metricValue: updatedValue
        }
      });
    }

    res.json({
      success: true,
      message: `Marked ${notifications.length} notifications as read`
    });

  } catch (error) {
    console.error('TCC_DEBUG: Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/test
 * Create a test notification
 */
router.post('/test', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: Create test notification for user:', req.user?.id);
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { type = 'info', title = 'Test Notification', message = 'This is a test notification' } = req.body;

    // Create test notification
    const notification = await prisma.systemAnalytics.create({
      data: {
        metricName: 'notification',
        metricValue: {
          type: type,
          title: title,
          message: message,
          read: false,
          createdAt: new Date().toISOString()
        },
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Test notification created',
      data: notification
    });

  } catch (error) {
    console.error('TCC_DEBUG: Create test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
