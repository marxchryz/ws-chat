const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/150C/?text=user',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
