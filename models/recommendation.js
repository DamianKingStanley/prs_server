import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference the user collection
    required: true,
  },
  category: {
    type: String,
    default: null,
  },
  searchQuery: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("recommendation", recommendationSchema);
