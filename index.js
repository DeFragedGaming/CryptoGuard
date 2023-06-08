const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
const connectionURL = process.env.MONGODB_URL;
mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// MongoDB Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});