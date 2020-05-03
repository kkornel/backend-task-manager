const { Router } = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new Router();

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // One way
    // const tasks = await Task.find({ author: req.user._id });

    // Second way
    // await req.user.populate('tasks').execPopulate();
    // const tasks = req.user.tasks;

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    // 500 Internal Server Error
    res.status(500).send(error);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, author: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    // 500 Internal Server Error
    res.status(500).send(error);
  }
});

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, author: req.user._id });

  try {
    await task.save();
    // 201 Created
    res.status(201).send(task);
  } catch (error) {
    // 400 Bad Request
    res.status(400).send(error);
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  const { body: values } = req;

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = values[update]));
    await task.save();

    // Can't do that, because this way omits the middleware used in userSchema
    // such us: userSchema.pre(...). Have to split this in 3 lines, like above.
    // const task = await Task.findByIdAndUpdate(id, values, {
    //   // return updated user
    //   new: true,
    //   runValidators: true,
    // });
    // if (!task) {
    //   return res.status(404).send();
    // }

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    // 500 Internal Server Error
    res.status(500).send(error);
  }
});

module.exports = router;
