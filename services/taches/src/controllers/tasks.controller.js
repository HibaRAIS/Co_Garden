// const pool = require('../db');
// const { verifyMember } = require('../membersClient');

// // ✅ POST /api/tasks
// exports.createTask = async (req, res) => {
//   const { title, description, due_date, status = 'to_do', memberIds = [] } = req.body;

//   try {
//     // Validate each member ID
//     for (let memberId of memberIds) {
//       const valid = await verifyMember(memberId);
//       if (!valid) {
//         return res.status(400).json({ error: `Invalid member ID: ${memberId}` });
//       }
//     }

//     // Create the task
//     const result = await pool.query(
//       `INSERT INTO tasks (title, description, due_date, status)
//        VALUES ($1, $2, $3, $4)
//        RETURNING *`,
//       [title, description, due_date, status]
//     );

//     const task = result.rows[0];

//     // Assign members to task
//     for (let memberId of memberIds) {
//       await pool.query(
//         `INSERT INTO task_assignments (task_id, member_id)
//          VALUES ($1, $2)`,
//         [task.id, memberId]
//       );
//     }

//     res.status(201).json(task);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.getTasks = async (req, res) => {
//     const { memberId, status, search, fromDate, toDate } = req.query;

//     try {
//       let query = `
//         SELECT t.*,
//           ARRAY(
//             SELECT member_id
//             FROM task_assignments ta
//             WHERE ta.task_id = t.id
//           ) AS assigned_members
//         FROM tasks t
//       `;
//       const conditions = [];
//       const values = [];

//       if (memberId) {
//         conditions.push(`
//           t.id IN (
//             SELECT task_id FROM task_assignments WHERE member_id = $${values.length + 1}
//           )
//         `);
//         values.push(memberId);
//       }

//       if (status) {
//         conditions.push(`t.status = $${values.length + 1}`);
//         values.push(status);
//       }

//       if (search) {
//         // Search title OR description, case-insensitive
//         conditions.push(`(t.title ILIKE $${values.length + 1} OR t.description ILIKE $${values.length + 1})`);
//         values.push(`%${search}%`);
//       }

//       if (fromDate) {
//         conditions.push(`t.due_date >= $${values.length + 1}`);
//         values.push(fromDate);
//       }

//       if (toDate) {
//         conditions.push(`t.due_date <= $${values.length + 1}`);
//         values.push(toDate);
//       }

//       if (conditions.length > 0) {
//         query += ' WHERE ' + conditions.join(' AND ');
//       }

//       query += ' ORDER BY due_date ASC';

//       const result = await pool.query(query, values);
//       res.json(result.rows);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };

// // ✅ PUT /api/tasks/:id/assign
// exports.assignTask = async (req, res) => {
//     const taskId = req.params.id;
//     const { memberIds } = req.body;

//     try {
//       // Verify all members (mocked or real)
//       for (let memberId of memberIds) {
//         const valid = await verifyMember(memberId);
//         if (!valid) {
//           return res.status(400).json({ error: `Invalid member ID: ${memberId}` });
//         }
//       }

//       // Remove old assignments
//       await pool.query('DELETE FROM task_assignments WHERE task_id = $1', [taskId]);

//       // Insert new ones
//       for (let memberId of memberIds) {
//         await pool.query(
//           `INSERT INTO task_assignments (task_id, member_id) VALUES ($1, $2)`,
//           [taskId, memberId]
//         );
//       }

//       res.status(200).json({ message: 'Task reassigned successfully.' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };

// // ✅ GET /api/calendar
// exports.getCalendar = async (req, res) => {
//   const { memberId, fromDate, toDate } = req.query;

//   try {
//     let query = `
//       SELECT
//         t.id,
//         t.title,
//         t.due_date AS date,
//         t.status,
//         ARRAY(
//           SELECT member_id
//           FROM task_assignments ta2
//           WHERE ta2.task_id = t.id
//         ) AS assigned_members
//       FROM tasks t
//     `;

//     const where = [];
//     const values = [];

//     // optional member filter (requires join)
//     if (memberId) {
//       query += ` JOIN task_assignments ta ON t.id = ta.task_id `;
//       where.push(` ta.member_id = $${values.length + 1} `);
//       values.push(memberId);
//     }

//     // optional date range filters
//     if (fromDate) {
//       where.push(` t.due_date >= $${values.length + 1} `);
//       values.push(fromDate);
//     }
//     if (toDate) {
//       where.push(` t.due_date <= $${values.length + 1} `);
//       values.push(toDate);
//     }

//     if (where.length) {
//       query += ` WHERE ${where.join(' AND ')} `;
//     }

//     query += ` ORDER BY t.due_date ASC NULLS LAST`;

//     // ✅ logs INSIDE the function (query exists here)
//     console.log('[getCalendar] SQL =>\n', query);
//     console.log('[getCalendar] params =>', values);

//     const result = await pool.query(query, values);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('getCalendar error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.updateTask = async (req, res) => {
//     const { id } = req.params;
//     const { title, description, due_date, status, memberIds } = req.body;

//     try {
//       // Update only fields that are provided
//       await pool.query(
//         `UPDATE tasks
//          SET
//            title = COALESCE($1, title),
//            description = COALESCE($2, description),
//            due_date = COALESCE($3, due_date),
//            status = COALESCE($4, status),
//            updated_at = NOW()
//          WHERE id = $5`,
//         [title, description, due_date, status, id]
//       );

//       // Update member assignments if provided
//       if (memberIds) {
//         await pool.query(`DELETE FROM task_assignments WHERE task_id = $1`, [id]);

//         for (let memberId of memberIds) {
//           await pool.query(
//             `INSERT INTO task_assignments (task_id, member_id) VALUES ($1, $2)`,
//             [id, memberId]
//           );
//         }
//       }

//       const result = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
//       res.json(result.rows[0]);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };

//   exports.deleteTask = async (req, res) => {
//     const { id } = req.params;

//     try {
//       await pool.query(`DELETE FROM tasks WHERE id=$1`, [id]);
//       res.json({ message: `Task ${id} deleted` });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };

// src/controllers/tasks.controller.js
const prisma = require("../lib/prisma");
const { verifyMember } = require("../membersClient");

const allowedStatus = new Set(["to_do", "in_progress", "done"]);
const isNonEmpty = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "";
const normalizeDate = (d) => (d ? new Date(d) : null);

// -------------------- POST /api/tasks --------------------
// body: { title, description?, due_date (YYYY-MM-DD), status?, memberIds?: string[] }
exports.createTask = async (req, res) => {
  const {
    title,
    description,
    due_date,
    status = "to_do",
    memberIds = [],
  } = req.body;

  try {
    console.log("[createTask] Received data:", {
      title,
      description,
      due_date,
      status,
      memberIds,
    });

    if (!isNonEmpty(title)) {
      return res.status(400).json({ error: "title required" });
    }

    // Validate each member ID (preserved from your version)
    for (const memberId of memberIds) {
      const ok = await verifyMember(memberId);
      if (!ok)
        return res
          .status(400)
          .json({ error: `Invalid member ID: ${memberId}` });
    }

    const data = {
      title,
      description: isNonEmpty(description) ? description : null,
      due_date: normalizeDate(due_date),
      status: allowedStatus.has(status) ? status : "to_do",
      task_assignments: memberIds.length
        ? { create: memberIds.map((m) => ({ member_id: String(m) })) }
        : undefined,
    };

    console.log("[createTask] Prisma data:", data);

    const t = await prisma.tasks.create({
      data,
      include: { task_assignments: { select: { member_id: true } } },
    });

    res.status(201).json({
      id: t.id,
      title: t.title,
      description: t.description,
      due_date: t.due_date,
      status: t.status,
      assigned_members: t.task_assignments.map((a) => a.member_id),
    });
  } catch (err) {
    console.error("[createTask] error:", err);
    console.error("[createTask] error message:", err.message);
    console.error("[createTask] error stack:", err.stack);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// -------------------- GET /api/tasks --------------------
// query: memberId, status, search, fromDate, toDate
exports.getTasks = async (req, res) => {
  const { memberId, status, search, fromDate, toDate } = req.query;

  try {
    const where = { AND: [] };

    if (isNonEmpty(memberId)) {
      where.AND.push({
        task_assignments: { some: { member_id: String(memberId) } },
      });
    }
    if (isNonEmpty(status) && allowedStatus.has(status)) {
      where.AND.push({ status });
    }
    if (isNonEmpty(search)) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (isNonEmpty(fromDate) || isNonEmpty(toDate)) {
      const range = {};
      if (isNonEmpty(fromDate)) range.gte = normalizeDate(fromDate);
      if (isNonEmpty(toDate)) range.lte = normalizeDate(toDate);
      where.AND.push({ due_date: range });
    }

    const rows = await prisma.tasks.findMany({
      where: where.AND.length ? where : undefined,
      orderBy: { due_date: "asc" },
      include: { task_assignments: { select: { member_id: true } } },
    });

    const data = rows.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      due_date: t.due_date,
      status: t.status,
      assigned_members: t.task_assignments.map((a) => a.member_id),
    }));

    res.json(data);
  } catch (err) {
    console.error("[getTasks] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- PUT /api/tasks/:id/assign --------------------
exports.assignTask = async (req, res) => {
  const taskId = Number(req.params.id);
  const { memberIds = [] } = req.body;

  try {
    if (Number.isNaN(taskId))
      return res.status(400).json({ error: "Invalid task id" });

    for (const memberId of memberIds) {
      const ok = await verifyMember(memberId);
      if (!ok)
        return res
          .status(400)
          .json({ error: `Invalid member ID: ${memberId}` });
    }

    await prisma.$transaction(async (tx) => {
      await tx.task_assignments.deleteMany({ where: { task_id: taskId } });
      if (memberIds.length) {
        await tx.task_assignments.createMany({
          data: memberIds.map((m) => ({
            task_id: taskId,
            member_id: String(m),
          })),
        });
      }
    });

    res.json({ message: "Task reassigned successfully." });
  } catch (err) {
    console.error("[assignTask] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- GET /api/calendar --------------------
// query: memberId, fromDate, toDate
exports.getCalendar = async (req, res) => {
  const { memberId, fromDate, toDate } = req.query;

  try {
    const where = { AND: [] };

    if (isNonEmpty(memberId)) {
      where.AND.push({
        task_assignments: { some: { member_id: String(memberId) } },
      });
    }
    if (isNonEmpty(fromDate) || isNonEmpty(toDate)) {
      const range = {};
      if (isNonEmpty(fromDate)) range.gte = normalizeDate(fromDate);
      if (isNonEmpty(toDate)) range.lte = normalizeDate(toDate);
      where.AND.push({ due_date: range });
    }

    const rows = await prisma.tasks.findMany({
      where: where.AND.length ? where : undefined,
      orderBy: { due_date: "asc" },
      include: { task_assignments: { select: { member_id: true } } },
    });

    const events = rows.map((t) => ({
      id: t.id,
      title: t.title,
      date: t.due_date,
      status: t.status,
      assigned_members: t.task_assignments.map((a) => a.member_id),
    }));

    res.json(events);
  } catch (err) {
    console.error("[getCalendar] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- PUT /api/tasks/:id --------------------
exports.updateTask = async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, due_date, status, memberIds } = req.body;

  try {
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const data = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined
        ? { description: isNonEmpty(description) ? description : null }
        : {}),
      ...(due_date !== undefined ? { due_date: normalizeDate(due_date) } : {}),
      ...(allowedStatus.has(status) ? { status } : {}),
      updated_at: new Date(),
    };

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(memberIds)) {
        await tx.task_assignments.deleteMany({ where: { task_id: id } });
        if (memberIds.length) {
          await tx.task_assignments.createMany({
            data: memberIds.map((m) => ({ task_id: id, member_id: String(m) })),
          });
        }
      }
      return tx.tasks.update({
        where: { id },
        data,
        include: { task_assignments: { select: { member_id: true } } },
      });
    });

    res.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      due_date: updated.due_date,
      status: updated.status,
      assigned_members: updated.task_assignments.map((a) => a.member_id),
    });
  } catch (err) {
    console.error("[updateTask] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------- DELETE /api/tasks/:id --------------------
exports.deleteTask = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    await prisma.$transaction([
      prisma.task_assignments.deleteMany({ where: { task_id: id } }),
      prisma.tasks.delete({ where: { id } }),
    ]);

    res.json({ message: `Task ${id} deleted` });
  } catch (err) {
    console.error("[deleteTask] error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
