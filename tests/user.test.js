const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'User One',
  email: 'userone@wp.pl',
  password: 'qwerty1234',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

beforeEach(async () => {
  await User.deleteMany({});
  await new User(userOne).save();
});

test('should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Kornel',
      email: 'kornel@example.com',
      password: 'MyPass777!',
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about response
  expect(response.body).toMatchObject({
    user: {
      name: 'Kornel',
      email: 'kornel@example.com',
    },
    token: user.tokens[0].token,
  });

  // Expect to be hashed
  expect(user.password).not.toBe('MyPass777!');
});

test('should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login nonexisitng user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'nonexisting@gmail.com',
      password: '1234qwer',
    })
    .expect(400);
});

test('should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});
