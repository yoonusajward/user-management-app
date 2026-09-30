import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const idToken = authorization.split("Bearer ")[1];

    await adminAuth.verifyIdToken(idToken);

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const status = body.status;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Invalid status." },
        { status: 400 }
      );
    }

    const newUser = await adminAuth.createUser({
      displayName: name,
      email,
      password,
      disabled: false,
    });

    try {
      await adminDb
        .collection("users")
        .doc(newUser.uid)
        .set({
          name,
          email,
          status,
          createdAt: new Date(),
        });
    } catch (error) {
      await adminAuth.deleteUser(newUser.uid);
      throw error;
    }

    return NextResponse.json(
      {
        message: "User created successfully.",
        userId: newUser.uid,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create user error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/email-already-exists"
    ) {
      return NextResponse.json(
        {
          message:
            "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Unable to create user.",
      },
      { status: 500 }
    );
  }
}