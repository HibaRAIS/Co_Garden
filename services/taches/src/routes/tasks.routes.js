// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/tasks.controller');

// router.post('/tasks', controller.createTask);
// router.get('/tasks', controller.getTasks);
// router.put('/tasks/:id/assign', controller.assignTask);
// router.get('/calendar', controller.getCalendar);
// router.put('/tasks/:id', controller.updateTask);
// router.delete('/tasks/:id', controller.deleteTask);

// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/tasks.controller');

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [to_do, in_progress, done]
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/tasks', controller.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (optionally filtered)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter by member ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_do, in_progress, done]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/tasks', controller.getTasks);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   put:
 *     summary: Assign members to a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members assigned successfully
 */
router.put('/tasks/:id/assign', controller.assignTask);

/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: Get calendar events (tasks with due dates)
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Calendar events
 */
router.get('/calendar', controller.getCalendar);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [to_do, in_progress, done]
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/tasks/:id', controller.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.delete('/tasks/:id', controller.deleteTask);

module.exports = router;
