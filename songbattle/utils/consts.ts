export const __prod__ = process.env.NODE_ENV === "production" ? true : false;
export const url = __prod__
  ? "https://songbattle-rose.vercel.app"
  : "http://localhost:3000";
