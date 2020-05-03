const express = require('express');
require('./db/mongoose');
const multer = require('multer');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();

const upload = multer({
  dest: 'images',
});

app.post('/upload', upload.single('upload'), (req, res) => {
  res.send();
});

// Automatically parse incoming JSON to an object
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
