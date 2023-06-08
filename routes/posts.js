const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Create a new blog post
router.post('/', async (req, res) => {
    try {
      const { title, content, author } = req.body;
      const post = new Post({
        title,
        content,
        author
      });
      const savedPost = await post.save();
      res.json(savedPost);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while creating the blog post' });
    }
  });
  
  // Get all blog posts
  router.get('/', async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while fetching the blog posts' });
    }
  });
  
  // Get a specific blog post by ID
  router.get('/:postId', async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while fetching the blog post' });
    }
  });
  
  // Update a blog post
  router.patch('/:postId', async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.postId,
        { $set: req.body },
        { new: true }
      );
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while updating the blog post' });
    }
  });
  
  // Delete a blog post
  router.delete('/:postId', async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json({ message: 'Blog post deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while deleting the blog post' });
    }
  });
  
  module.exports = router;