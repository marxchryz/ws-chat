const { User } = require('../models');

exports.post = async (req, res) => {
  const { username } = req.body;
  try {
    let user = await User.findOne({ username });

    if (user) return res.json({ success: true, user });

    user = await User.create({
      username,
      image: 'https://via.placeholder.com/150C/?text=' + username.split('')[0],
    });

    return res.json({ success: true, user });
  } catch (err) {
    throw err;
  }
};
