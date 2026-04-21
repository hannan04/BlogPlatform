import type { Connection } from "mongoose";

export function connectToDatabase(): Promise<Connection>;
