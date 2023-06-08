const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// Configure Helmet security headers
app.use(helmet());

// Enable rate limiting for login endpoint
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per windowMs
});
app.use('/login', limiter);

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
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await user.create(username, hashedPassword);
      // Store the user's public key in the database or associate it with the user
      await user.setPublicKey(username, publicKey);
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
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // Generate JWT token for authentication
      const token = jwt.sign({ username: foundUser.username }, 'your-secret-key', { expiresIn: '1h' });

      // Retrieve the user's public key from the database or associated with the user
      const userPublicKey = await user.getPublicKey(username);

      // Handle successful login
      res.status(200).json({ message: 'Login successful', token, publicKey: userPublicKey });
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Failed to find user' });
    }
  });

  // Handle incoming messages
  io.on('connection', (socket) => {
    // Decrypt incoming messages using the server's private key
    function decryptMessage(encryptedMessage) {
      const decryptedMessage = crypto.privateDecrypt(privateKey, encryptedMessage);
      return decryptedMessage.toString();
    }

    // Encrypt outgoing messages using the recipient's public key
    function encryptMessage(message, publicKey) {
      const encryptedMessage = crypto.publicEncrypt(publicKey, Buffer.from(message));
      return encryptedMessage;
    }

    // Handle received messages
    socket.on('message', async (data) => {
      const { recipient, message, token } = data;

      try {
        // Verify and decode the JWT token
        const decodedToken = jwt.verify(token, 'your-secret-key');

        // Retrieve the recipient's public key from the database or associated with the user
        const recipientPublicKey = await user.getPublicKey(recipient);

        // Decrypt the received message
        const decryptedMessage = decryptMessage(message);

        // Process the decrypted message

        // ...

        // Encrypt and send the message to the recipient
        const encryptedMessage = encryptMessage(decryptedMessage, recipientPublicKey);
        socket.emit('message', { sender: 'Server', message: encryptedMessage });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // ...
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
