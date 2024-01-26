const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const UrlModel = mongoose.model("UrlS", urlSchema);

module.exports = UrlModel;
