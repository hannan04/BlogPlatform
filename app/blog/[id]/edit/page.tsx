"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type JwtPayload = {
  userId: string;
};

type BlogResponse = {
  blog?: {
    _id: string;
    title: string;
    content: string;
    author?: {
      _id?: string;
    };
  };
  message?: string;
};

function getAuthPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = useMemo(() => (token ? getAuthPayload(token)?.userId : null), [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.replace("/login");
      return;
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    async function loadBlog() {
      try {
        const response = await fetch(`/api/blogs/${params.id}`);
        const data = (await response.json()) as BlogResponse;

        if (!response.ok || !data.blog) {
          setError(data.message || "Unable to load post.");
          return;
        }

        if (currentUserId && data.blog.author?._id !== currentUserId) {
          setError("You are not allowed to edit this post.");
          return;
        }

        setTitle(data.blog.title);
        setContent(data.blog.content);
      } catch {
        setError("Something went wrong while loading the post.");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadBlog();
    }
  }, [params.id, token, currentUserId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "Failed to update post.");
        return;
      }

      setSuccess("Post updated successfully.");
      setTimeout(() => router.push(`/blog/${params.id}`), 700);
    } catch {
      setError("Something went wrong while updating.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Edit blog post</h1>
        <p className="text-sm text-slate-600">Update your post and save changes.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading post...</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="content" className="text-sm font-medium text-slate-700">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-56 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
            <Link href={`/blog/${params.id}`} className="text-sm text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
