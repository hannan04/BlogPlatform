import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getFeaturedPosts } from "@/lib/posts";

export async function GET() {
  await connectToDatabase();
  console.log("DB Connected");
  const posts = getFeaturedPosts();
  return NextResponse.json({ posts });
}
