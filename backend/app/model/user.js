const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profilePhoto: {
    type: String, // file path or URL
    required: true
  },
  username: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
    match: [/^\S+$/, 'No spaces allowed']
  },
  password: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    enum: ['Student', 'Developer', 'Entrepreneur'],
    required: true
  },
  companyName: {
    type: String
  },
  address1: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['Basic', 'Pro', 'Enterprise'],
    required: true
  },
  newsletter: {
    type: Boolean,
    default: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  genderOther: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
