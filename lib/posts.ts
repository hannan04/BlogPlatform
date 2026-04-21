import type { Post } from "@/models/Post";

const samplePosts: Post[] = [
  {
    id: "1",
    title: "Welcome to your blog platform",
    slug: "welcome-to-your-blog-platform",
    excerpt: "Start building your post listing and detail pages with App Router."
  },
  {
    id: "2",
    title: "Create API routes with route handlers",
    slug: "create-api-routes-with-route-handlers",
    excerpt: "Use app/api/*/route.ts files for your backend endpoints."
  }
];

export function getFeaturedPosts(): Post[] {
  return samplePosts;
}
