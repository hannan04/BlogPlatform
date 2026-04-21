import jwt from "jsonwebtoken";
import type { IUser } from "@/models/User";

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Please define the JWT_SECRET environment variable.");
  }
  return jwtSecret;
}

type AuthPayload = {
  userId: string;
  email: string;
  name: string;
};

export function signAuthToken(user: Pick<IUser, "_id" | "email" | "name">) {
  const payload: AuthPayload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthPayload;
}

export function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}
