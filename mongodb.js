// const { MongoClient, ObjectID } = require('mongodb');

// const connectionURL = 'mongodb://localhost:27017';
// const dbName = 'task-manager';

// MongoClient.connect(
//   connectionURL,
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   (err, client) => {
//     if (err) {
//       return console.log(err);
//     }

//     console.log('Connected');

//     const db = client.db(dbName);

//     db.collection('users').insertOne(
//       {
//         name: 'Jen',
//         age: 24,
//       },
//       (error, result) => {
//         if (error) {
//           return console.log('Unable to insert user');
//         }

//         console.log(result.ops);
//       }
//     );

//     db.collection('tasks').insertMany(
//       [
//         { description: 'Clean the house', completed: true },
//         { description: 'Renew inspection', completed: false },
//       ],
//       (error, result) => {
//         if (error) {
//           return console.log('Unable to insert tasks!');
//         }
//         console.log(result.ops);
//       }
//     );

//     db.collection('tasks')
//       .find({ completed: false })
//       .toArray((error, tasks) => {
//         console.log(tasks);
//       });

//     db.collection('tasks').findOne(
//       { _id: new ObjectID('5c0fec243ef6bdfbe1d62e2f') },
//       (error, task) => {
//         console.log(task);
//       }
//     );

//     db.collection('users').findOne({ name: 'Jen' }, (error, user) => {
//       if (error) {
//         return console.log('Unable to insert user');
//       }

//       console.log(user);
//     });

//     db.collection('users')
//       .updateOne(
//         { _id: new ObjectID('5c0fe6634362c1fb75b9d6b5') },
//         { $inc: { age: 1 } }
//       )
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     db.collection('tasks')
//       .updateMany({ completed: false }, { $set: { completed: true } })
//       .then((result) => {
//         console.log(result.modifiedCount);
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     db.collection('users')
//       .deleteMany({ age: 27 })
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     db.collection('tasks')
//       .deleteOne({ description: 'Clean the house' })
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }
// );
