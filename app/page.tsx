import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";

type BlogListItem = {
  _id: string;
  title: string;
  content: string;
  author?: {
    name?: string;
    email?: string;
  };
};

function getPreview(content: string, maxLength = 140) {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trimEnd()}...`;
}

export default async function HomePage() {
  let blogDocs: Array<{
    _id: unknown;
    title: string;
    content: string;
    author?: unknown;
  }> = [];
  let dbErrorMessage: string | null = null;

  try {
    await connectToDatabase();
    blogDocs = await Blog.find({}).sort({ createdAt: -1 }).populate("author", "name email").lean();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    if (message.includes("MONGODB_URI")) {
      dbErrorMessage = "Database is not configured. Add `MONGODB_URI` in `.env.local`.";
    } else {
      dbErrorMessage = "Database connection failed. Check MongoDB URI, network, and cluster access.";
    }
  }

  const blogs: BlogListItem[] = blogDocs.map((blog) => ({
    _id: String(blog._id),
    title: blog.title,
    content: blog.content,
    author:
      blog.author && typeof blog.author === "object"
        ? {
            name: "name" in blog.author ? (blog.author.name as string | undefined) : undefined,
            email: "email" in blog.author ? (blog.author.email as string | undefined) : undefined
          }
        : undefined
  }));

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Blog Posts</h1>
        <p className="muted-text text-sm sm:text-base">Read what the community is publishing.</p>
      </div>
      {dbErrorMessage ? (
        <div className="surface-card p-4 text-sm text-amber-700 dark:text-amber-300">
          {dbErrorMessage}
        </div>
      ) : null}

      {blogs.length === 0 ? (
        <div className="surface-card p-6 text-sm muted-text">
          No posts yet. Be the first to publish one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blog/${blog._id}`}
              className="surface-card group block h-full p-5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
            >
              <article className="flex h-full flex-col">
                <h2 className="text-xl font-semibold text-slate-900 transition group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                  {blog.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {getPreview(blog.content)}
                </p>
                <p className="mt-auto pt-4 text-xs text-slate-500 dark:text-slate-400">
                  By {blog.author?.name || blog.author?.email || "Unknown author"}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
