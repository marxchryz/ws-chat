const { User, Chat } = require('../models');
const mongoose = require('mongoose');

module.exports = (client) => {
  client.on('connection', async function (socket) {
    // Get chats from mongo collection
    socket.on('viewOne', async function (data) {
      let roomId =
        data.from > data.to ? data.from + data.to : data.to + data.from;

      let chats = await Chat.find({}, null, { sort: { _id: 1 } })
        .populate('from', ['username'])
        .populate('to', ['username']);

      let receiver = await User.findOne({ username: data.to });

      chats = chats.filter((chat) => {
        return (
          chat.from &&
          chat.to &&
          ((chat.from.username === data.from && chat.to.username === data.to) ||
            (chat.from.username === data.to && chat.to.username === data.from))
        );
      });

      socket.emit('showChat', { receiver, chats, first: true });
    });

    // Handle input events
    socket.on('input', async function (data) {
      let { from, to, message } = data;

      let receiver = await User.findOne({ username: to });
      let sender = await User.findOne({ username: from });

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

      // Send status object
      let roomId = from > to ? from + to : to + from;

      socket.join(roomId);

      // Send users and room info
      client.to(roomId).emit('showChat', { receiver, chats: [chat] });

      chat.message = from + ': ' + chat.message;
      socket.in(roomId).emit('newMessage', { receiver, sender, chats: [chat] });
    });

    socket.on('viewAllUsers', async function (username) {
      let users = await User.find({ username: { $ne: username } });
      let current = await User.findOne({ username });
      users = users.map((user) => {
        let roomId =
          username > user.username
            ? username + user.username
            : user.username + username;
        socket.join(roomId);
        return {
          _id: user._id,
          username: '@' + user.username,
          image: user.image,
        };
      });

      let chats = await Chat.find(
        {
          $or: [{ from: current._id }, { to: current._id }],
        },
        null,
        { sort: { _id: -1 } }
      )
        .populate('from')
        .populate('to');

      console.log(chats);

      users = users.map((user) => {
        let latestMessage = '',
          latestMessageId = '';
        chats.map((chat) => {
          if (
            !latestMessage &&
            chat &&
            [chat.from._id.toString(), chat.to._id.toString()].includes(
              user._id.toString()
            )
          ) {
            latestMessage = chat.from.username + ': ' + chat.message;
            latestMessageId = chat._id;
          }
        });
        return { ...user, latestMessage, latestMessageId };
      });

      console.log(users);

      users.sort((a, b) => {
        return a.latestMessageId > b.latestMessageId ? -1 : 1;
      });

      socket.emit('showAllUsers', users);
    });
  });
};
