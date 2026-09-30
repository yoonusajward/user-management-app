import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
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

    if (password && password.length < 8) {
      return NextResponse.json(
        { message: "New password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Invalid status." },
        { status: 400 }
      );
    }

    const existingUser = await adminAuth.getUser(id);

    const authUpdate: {
      displayName: string;
      email: string;
      password?: string;
    } = {
      displayName: name,
      email,
    };

    if (password) {
      authUpdate.password = password;
    }

    await adminAuth.updateUser(id, authUpdate);

    await adminDb.collection("users").doc(id).update({
      name,
      email,
      status,
    });

    return NextResponse.json({
      message: "User updated successfully.",
      previousEmail: existingUser.email,
    });
  } catch (error: unknown) {
    console.error("Update user error:", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "auth/email-already-exists") {
        return NextResponse.json(
          { message: "A user with this email already exists." },
          { status: 409 }
        );
      }

      if (error.code === "auth/user-not-found") {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Unable to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { id } = await context.params;

    if (decodedToken.uid === id) {
      return NextResponse.json(
        { message: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    await adminAuth.getUser(id);
    await adminAuth.deleteUser(id);
    await adminDb.collection("users").doc(id).delete();

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error: unknown) {
    console.error("Delete user error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/user-not-found"
    ) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Unable to delete user." },
      { status: 500 }
    );
  }
}
