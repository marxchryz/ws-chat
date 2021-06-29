const { User, Chat } = require('./models');
const mongoose = require('mongoose');

const client = require('socket.io')(3000, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const app = require('./startup/app');

app.listen(5000, () => console.log(`Server has started on port 5000`));
require('./routes')(app);
require('./startup/db')();
require('./sockets')(client);
