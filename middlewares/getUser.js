const User = require('../models/UserModel');

const getUser = async (req, res, next) => {
  let user;

  try {
    // findById() gets one user from Model
    user = await User.findById(req.params.id);

    if (user == null) {
      // 404 means you can't find something
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  return next();
};

module.exports = getUser;
