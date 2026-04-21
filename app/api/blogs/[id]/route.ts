import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";



function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid blog id." }, { status: 400 });
    }

    await connectToDatabase();
    const blog = await Blog.findById(id).populate("author", "name email");

    if (!blog) {
      return NextResponse.json({ message: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Fetch blog error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid blog id." }, { status: 400 });
    }

    const updates = await request.json();
    const allowedUpdates = ["title", "content"];
    const updateKeys = Object.keys(updates);

    if (updateKeys.length === 0) {
      return NextResponse.json({ message: "No updates provided." }, { status: 400 });
    }

    const isValidUpdate = updateKeys.every((key) => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      return NextResponse.json({ message: "Invalid update fields." }, { status: 400 });
    }

    const token = getBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    let authUserId = "";
    try {
      authUserId = verifyAuthToken(token).userId;
    } catch {
      return NextResponse.json({ message: "Invalid token." }, { status: 401 });
    }

    await connectToDatabase();
    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return NextResponse.json({ message: "Blog not found." }, { status: 404 });
    }

    if (existingBlog.author.toString() !== authUserId) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const blog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate("author", "name email");

    if (!blog) {
      return NextResponse.json({ message: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog updated successfully.", blog }, { status: 200 });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid blog id." }, { status: 400 });
    }

    const token = getBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    let authUserId = "";
    try {
      authUserId = verifyAuthToken(token).userId;
    } catch {
      return NextResponse.json({ message: "Invalid token." }, { status: 401 });
    }

    await connectToDatabase();
    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return NextResponse.json({ message: "Blog not found." }, { status: 404 });
    }

    if (existingBlog.author.toString() !== authUserId) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json({ message: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
