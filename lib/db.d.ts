import mongoose from "mongoose";

export function connectToDatabase(): Promise<typeof mongoose>;
