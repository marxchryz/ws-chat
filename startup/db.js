const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/chat', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log('Database connected');
  } catch (err) {
    console.log(err);
  }
};
