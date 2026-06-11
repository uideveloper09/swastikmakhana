import path from "path";

/** Writable data path — /tmp on Vercel serverless, local data/ in dev. */
export function getWritableDataPath(filename: string): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", filename);
  }
  return path.join(process.cwd(), "data", filename);
}
