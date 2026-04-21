// import { NextResponse } from "next/server";
// import { getBearerToken, verifyAuthToken } from "@/lib/auth";
// import { connectToDatabase } from "../../../lib/db";
// import Blog from "@/models/Blog";

// export async function GET() {

//   /*try {
//     await connectToDatabase();
//   } catch (err) {
//     console.error("DB connection error:", err);
//     return NextResponse.json({ message: "Database unavailable." }, { status: 500 });
//   }*/

//   try {
//     console.log("ENV:", process.env.MONGODB_URI);
//     await connectToDatabase();

//     const blogs = await Blog.find({})
//       .sort({ createdAt: -1 })
//       .populate("author", "name email");

//     return NextResponse.json({ blogs }, { status: 200 });
//   } catch (error) {
//     console.error("Fetch blogs error:", error);
//     return NextResponse.json({ message: "Internal server error." }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const token = getBearerToken(request.headers.get("authorization"));
//     if (!token) {
//       return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
//     }

//     let payload;
//     try {
//       payload = verifyAuthToken(token);
//     } catch {
//       return NextResponse.json({ message: "Invalid token." }, { status: 401 });
//     }

//     if (!payload?.userId) {
//       return NextResponse.json({ message: "Invalid token." }, { status: 401 });
//     }

//     const { title, content } = await request.json();
//     if (!title || !content) {
//       return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
//     }

//     await connectToDatabase();
//     const blog = await Blog.create({ title, content, author: payload.userId });

//     return NextResponse.json(
//       { message: "Blog created successfully.", blog },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Create blog error:", error);
//     return NextResponse.json({ message: "Internal server error." }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";

// GET all blogs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const blog = await Blog.findById(params.id).populate("author", "name email");

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Fetch blog error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// POST new blog
export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      return NextResponse.json({ message: "Invalid token." }, { status: 401 });
    }

    if (!payload?.userId) {
      return NextResponse.json({ message: "Invalid token." }, { status: 401 });
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
    }

    await connectToDatabase();
    const blog = await Blog.create({ title, content, author: payload.userId });

    return NextResponse.json(
      { message: "Blog created successfully.", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

