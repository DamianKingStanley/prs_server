import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    userId: { type: String },
    fullname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    profilePicture: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Liked posts
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
