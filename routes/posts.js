const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Post = require('../models/post');

// Create a new post
router.post('/', authenticate, async (req, res) => {
  // Get the user ID from the request object
  const userId = req.userId;

  // Retrieve the post data from the request body
  const { title, content } = req.body;

  try {
    // Create a new post
    const post = new Post();
    post.title = title;
    post.content = content;
    post.author = userId;
    await post.save();

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update a post
router.put('/:postId', authenticate, async (req, res) => {
  // Get the user ID from the request object
  const userId = req.userId;

  // Get the post ID from the request parameters
  const postId = req.params.postId;

  // Retrieve the updated post data from the request body
  const { title, content } = req.body;

  try {
    // Find the post by ID and author
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Update the post
    post.title = title;
    post.content = content;
    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete a post
router.delete('/:postId', authenticate, async (req, res) => {
  // Get the user ID from the request object
  const userId = req.userId;

  // Get the post ID from the request parameters
  const postId = req.params.postId;

  try {
    // Find the post by ID and author
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the post
    await post.remove();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
