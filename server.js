require('dotenv').config();

const express = require('express');
// const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');

// routes
const userRouter = require('./routes/userRouter');

const PORT = process.env.PORT || 5000;

// set up express
const app = express();

// set up middlewares
app.use(express.json());
app.use(cors());

// set up mongoose
mongoose.connect(process.env.MONGO_CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database is running'));

// router middlewares
app.use('/users', userRouter);

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
