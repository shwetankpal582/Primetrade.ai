const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  const query = { user: req.user.id };

  // Add filters
  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.priority) {
    query.priority = req.query.priority;
  }

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }

  if (req.query.tag) {
    query.tags = { $in: [req.query.tag] };
  }

  // Handle date filters
  if (req.query.dueBefore) {
    query.dueDate = { ...query.dueDate, $lte: new Date(req.query.dueBefore) };
  }

  if (req.query.dueAfter) {
    query.dueDate = { ...query.dueDate, $gte: new Date(req.query.dueAfter) };
  }

  // Build sort
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .sort(sort)
    .limit(limit)
    .skip(startIndex)
    .populate('user', 'name email');

  // Pagination
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.json({
    success: true,
    count: tasks.length,
    total,
    pagination,
    data: tasks
  });
}));

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('user', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
}));

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, description, status, priority, dueDate, tags } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    tags,
    user: req.user.id
  });

  const populatedTask = await Task.findById(task._id).populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populatedTask
  });
}));

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      return new Date(value).toString() !== 'Invalid Date';
    })
    .withMessage('Due date must be a valid date or null'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const { title, description, status, priority, dueDate, tags } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  }
  if (tags !== undefined) updateData.tags = tags;

  task = await Task.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
}));

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @desc    Get task statistics for user
// @route   GET /api/tasks/stats/overview
// @access  Private
router.get('/stats/overview', protect, asyncHandler(async (req, res) => {
  const stats = await Task.getUserStats(req.user.id);

  // Get overdue tasks count
  const overdueCount = await Task.countDocuments({
    user: req.user.id,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });

  // Get tasks due today
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueTodayCount = await Task.countDocuments({
    user: req.user.id,
    dueDate: {
      $gte: today.setHours(0, 0, 0, 0),
      $lt: tomorrow.setHours(0, 0, 0, 0)
    },
    status: { $nin: ['completed', 'cancelled'] }
  });

  res.json({
    success: true,
    data: {
      ...stats,
      overdue: overdueCount,
      dueToday: dueTodayCount
    }
  });
}));

module.exports = router;

