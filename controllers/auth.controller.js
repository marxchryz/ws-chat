const { User } = require('../models');

exports.post = async (req, res) => {
  const { username } = req.body;
  try {
    let user = await User.findOne({ username });

    if (user) return res.json({ success: true, user });

    user = await User.create({
      username,
    });

    return res.json({ success: true, user });
  } catch (err) {
    throw err;
  }
};
