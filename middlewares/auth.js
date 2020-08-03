const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'No authentication token, authorization denied.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res
        .status(401)
        .json({ message: 'Token verification failed, authorization denied.' });
    }

    res.user = verified.id;
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = auth;
