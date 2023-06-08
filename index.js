const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
client.connect((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');

  // User registration endpoint
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const user = new User(client.db('chat-app'));

    try {
      const userId = await user.create(username, password);
      res.status(201).json({ userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // User login endpoint
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = new User(client.db('chat-app'));

    try {
      const foundUser = await user.findByUsername(username);
      if (!foundUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check password validity
      if (foundUser.password !== password) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      // Handle successful login
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Failed to find user' });
    }
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
