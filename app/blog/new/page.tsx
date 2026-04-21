"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type JwtPayload = {
  userId: string;
  email: string;
  name: string;
  exp: number;
};

type CreateBlogResponse = {
  message: string;
};

function getAuthPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.replace("/login");
      return;
    }

    const payload = getAuthPayload(savedToken);
    if (!payload?.userId) {
      localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    setToken(savedToken);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    if (!token) {
      setError("Please log in again.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });

      const data: CreateBlogResponse = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to publish post.");
        return;
      }

      setSuccess("Post published successfully.");
      setTitle("");
      setContent("");
      setTimeout(() => router.push("/blog"), 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Write a blog post</h1>
        <p className="text-sm text-slate-600">Share your ideas with your audience.</p>
      </div>

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
            placeholder="Enter a clear post title"
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
            placeholder="Write your post..."
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
            {isSubmitting ? "Publishing..." : "Publish post"}
          </button>
          <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
