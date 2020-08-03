const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Middlewares
const getUser = require('../middlewares/getUser');
const auth = require('../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:id', getUser, async (req, res) => {
  const { email, username } = res.user;
  res.json({ email, username });
});

router.post('/register', async (req, res) => {
  let { username } = req.body;
  const { email, password, passwordCheck } = req.body;

  // validations
  if (!email || !password || !passwordCheck) {
    return res
      .status(400)
      .json({ message: 'Not all fields have been entered.' });
  }

  if (password.length < 5) {
    return res.status(400).json({
      message: 'The password needs to be at least 5 characters long.',
    });
  }

  if (password !== passwordCheck) {
    return res.status(400).json({ message: 'Enter the same password twice.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'Account with this email already exists' });
  }

  if (!username) username = email;

  try {
    // encrypt user password using hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();

    return res.json(savedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Not all fields have been entered.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'No account with this email has been registered.' });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res
        .status(200)
        .json({ message: "Can't login, invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.json({
      message: `${user.username} is logged in`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* deleting a user using token as a header */
router.delete('/delete-token', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(res.user);
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', getUser, async (req, res) => {
  const userName = res.user.username;

  try {
    // remove() removes from database
    await res.user.remove();
    res.json({ message: `Deleted the user: ${userName}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('auth-token');
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
