const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User',
  },
  to: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
