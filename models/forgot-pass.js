const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Creating a Mongoose schema for the forgotpasswords collection
const forgotPassSchema = new Schema({
  requestId: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("ForgotPasses", forgotPassSchema);
