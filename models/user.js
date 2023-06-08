// models/user.js
const { ObjectId } = require('mongodb');

class User {
  constructor(db) {
    this.collection = db.collection('users');
  }

  async create(username, password) {
    const user = {
      username,
      password,
    };

    const result = await this.collection.insertOne(user);
    return result.insertedId;
  }

  async findByUsername(username) {
    const user = await this.collection.findOne({ username });
    return user;
  }
}

module.exports = User;
