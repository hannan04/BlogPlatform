"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type JwtPayload = {
  userId: string;
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

type BlogPostActionsProps = {
  blogId: string;
  authorId: string;
};

export function BlogPostActions({ blogId, authorId }: BlogPostActionsProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const currentUserId = useMemo(() => (token ? getAuthPayload(token)?.userId : null), [token]);
  const isOwner = currentUserId === authorId;

  async function handleDelete() {
    if (!token || !isOwner) {
      setError("You are not allowed to delete this post.");
      return;
    }

    const confirmed = window.confirm("Delete this post permanently?");
    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "Failed to delete post.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong while deleting.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Link
          href={`/blog/${blogId}/edit`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
