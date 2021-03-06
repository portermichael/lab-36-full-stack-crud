'use strict';

const mongoose = require('mongoose');
const User = require('./user.js');

const postSchema = mongoose.Schema({
  phoneNumber: {type: String, required: true, unique: true},
  address: {type: String, required: true},
  ad: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
});

postSchema.pre('save', function (next) {
  User.findById(this.user)
    .then((user) => {
      let postIDSet = new Set(user.posts);
      postIDSet.add(this._id);
      user.posts = Array.from(postIDSet);
      return user.save();
    })
    .then(() => next())
    .catch(() => next(new Error('Cannot create POST without valid USER')));
});

postSchema.post('remove', function (doc, next) {
  User.findById(doc.user)
    .then((user) => {
      user.posts = user.posts.filter((post) => post._id !== doc._id);
      return user.save();
    })
    .then(() => next())
    .catch(next);
});

module.exports = mongoose.model('post', postSchema);
