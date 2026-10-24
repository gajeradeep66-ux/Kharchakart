const Notification = require('../models/Notification');

// @desc    Get user's notifications (or broadcast notifications)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ timestamp: -1, createdAt: -1 });

    return res.status(200).json({
      notifications: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get count of unread notifications
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    return res.status(200).json({ unread_count: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: notification.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.deleteOne();
    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Clear all user notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.user._id,
    });

    return res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
