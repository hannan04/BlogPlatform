import Link from "next/link";
import type { Post } from "@/models/Post";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
      <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm text-blue-600">
        Read post
      </Link>
    </article>
  );
}
