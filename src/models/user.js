const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    // It is an array, because we want users to be able to be logged in
    // on multiple devices (PC, phones, etc). So logging out from one device
    // will not logout from another, makes sense.
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// virtual is not data stored in DB, it is relationship between two entities
// It is for mongoose to know how are those things related
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'author',
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWFkYmJmZDI0YWEyYTBlMjAyM2E3YmEiLCJpYXQiOjE1ODg0NzUyMDV9.WEB7c_JBNOVv9S5V-J49tn_qhDMr_Z-M74AcCg7ZJM0
  // PART_1.PART_2.PART_3
  // PART_1: base 64 encoded_know_as_header - contains meta info, it tells that is JWT and what algorithm was used to generate it
  // PART_2: payload_or_body - base_64_encoded_json_string - contains data that we provided (_id)
  // PART_3: signature used to verify token
  // The goal of the JWT isn't to hide the data, it is publicly viewable to anyone who has token
  // The whole point of JWT is to create data that is verifiable via these signature (JWT_SECRET)
  const token = jwt.sign({ _id: user._id.toSting() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw new Error('Unable to login.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Unable to login.');
  }

  return user;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ author: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
