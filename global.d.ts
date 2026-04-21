import type { Connection } from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: Connection | null;
        promise: Promise<unknown> | null;
      }
    | undefined;
}

export {};
