import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model("Blog", blogSchema);

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not defined");

    await mongoose.connect(uri);

    // Prevent duplicates: clear existing demo posts
    await Blog.deleteMany({});

    await Blog.insertMany([
      {
        title: "Welcome to BlogPlatform",
        content: "This is the very first demo post to show how blogs appear on the homepage.",
      },
      {
        title: "Getting Started",
        content: "Click 'Write' in the navbar to publish your own blog post.",
      },
      {
        title: "Community Guidelines",
        content: "Be respectful, share knowledge, and enjoy writing with others.",
      },
      {
        title: "Demo Post #4",
        content: "Another sample blog entry to demonstrate multiple posts on the front end.",
      },
    ]);

    console.log("✅ Demo blogs inserted successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
