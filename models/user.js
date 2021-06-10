const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membershipStatusList = ['Member', 'Not-member'];

const userSchema = new Schema({
  username: { type: String, required: true, minLength: 3, maxLength: 30 },
  password: { type: String, required: true, minLength: 3, maxLength: 150 },
  firstName: { type: String, required: true, minLength: 1, maxLength: 30 },
  lastName: { type: String, maxLength: 50 },
  membershipStatus: {
    type: String,
    required: true,
    enum: membershipStatusList,
    default: 'Not-member',
  },
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`;
});

module.exports = mongoose.model('User', userSchema);
