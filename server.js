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

// Connect to Socket.io
client.on('connection', async function (socket) {
  // Create function to send status
  sendStatus = function (s) {
    socket.emit('status', s);
  };

  socket.on('openChat', async (data) => {
    const { from, to = '' } = data;
    let roomId =
      data.from > data.to ? data.from + data.to : data.to + data.from;

    socket.join(roomId);

    // Send users and room info
    client.to(roomId).emit('notify', 'The user opened your chat');
    // console.log(roomId);
  });

  // Get chats from mongo collection
  socket.on('viewOne', async function (data) {
    let roomId =
      data.from > data.to ? data.from + data.to : data.to + data.from;

    let chats = await Chat.find({}, null, { sort: { _id: 1 } })
      .populate('from', ['username'])
      .populate('to', ['username']);

    let receiver = await User.findOne({ username: data.to });

    chats = chats.filter((chat) => {
      // console.log(chat);
      return (
        chat.from &&
        chat.to &&
        ((chat.from.username === data.from && chat.to.username === data.to) ||
          (chat.from.username === data.to && chat.to.username === data.from))
      );
    });

    socket.emit('showChat', { receiver, chats });
  });

  // Handle input events
  socket.on('input', async function (data) {
    let { from, to, message } = data;

    let receiver = await User.findOne({ username: to });
    let sender = await User.findOne({ username: from });

    // Check for name and message
    if (message == '') {
      // Send error status
      sendStatus('Please enter a message');
    } else {
      // Insert message
      let chat = await Chat.create({
        from: sender._id,
        to: receiver._id,
        message,
      });

      chat = await chat
        .populate('from', ['username'])
        .populate('to', ['username'])
        .execPopulate();

      // client.emit('output', [chat]);
      // Send status object
      sendStatus({
        message: 'Message sent',
        clear: true,
      });
      let roomId = from > to ? from + to : to + from;

      socket.join(roomId);

      // Send users and room info
      client.to(roomId).emit('showChat', { receiver, chats: [chat] });
    }
  });

  // Handle clear
  socket.on('clear', async function (data) {
    // Remove all chats from collection
    await Chat.deleteMany({});
    socket.emit('cleared');
  });

  socket.on('viewAllUsers', async function (username) {
    let users = await User.find({ username: { $ne: username } });
    users = users.map((user) => {
      return {
        username: '@' + user.username,
        image: user.image,
      };
    });
    socket.emit('showAllUsers', users);
  });
});
