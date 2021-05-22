import cookie from "cookie";

export const __prod__ = process.env.NODE_ENV === "production" ? true : false;
export const url = __prod__
  ? "https://songbattle-rose.vercel.app"
  : "http://localhost:3000";
export const generateId = (): String => {
  return Math.random().toString(36).substr(2, 9);
};
export const parseCookies = (req) => {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
};
