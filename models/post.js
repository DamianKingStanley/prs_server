import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true }, // URL or path to the photo
    description: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array to store likes
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", postSchema);
