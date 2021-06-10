const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DateTime } = require('luxon');

const messageSchema = new Schema({
  title: { type: String, required: true, maxLength: 50 },
  message: { type: String, required: true, maxLength: 300 },
  timestamp: { type: Date, default: Date.now, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

messageSchema.virtual('formattedDate').get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Message', messageSchema);
