import { notFound } from "next/navigation";
import { BlogPostActions } from "@/components/posts/BlogPostActions";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";

type BlogDetail = {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  author?: {
    _id: string;
    name?: string;
    email?: string;
  };
};



function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export default async function BlogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  await connectToDatabase();
  const blog = (await Blog.findById(id).populate("author", "name email").lean()) as
    | BlogDetail
    | null;

  if (!blog) {
    notFound();
  }

  const authorLabel = blog.author?.name || blog.author?.email || "Unknown author";
  const createdAt = new Date(blog.createdAt).toLocaleDateString();

  return (
    <article className="surface-card mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {blog.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By {authorLabel} • Published on {createdAt}
        </p>
        {blog.author?._id ? <BlogPostActions blogId={blog._id} authorId={blog.author._id} /> : null}
      </div>
      <div className="whitespace-pre-wrap leading-7 text-slate-800 dark:text-slate-200">{blog.content}</div>
    </article>
  );
}
