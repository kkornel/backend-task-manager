const express = require('express');
require('./db/mongoose');
const multer = require('multer');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();

// Automatically parse incoming JSON to an object
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
