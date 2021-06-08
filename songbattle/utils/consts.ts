import cookie from "cookie";
import { v4 as uuidv4 } from "uuid";

export const __prod__ = process.env.NODE_ENV === "production" ? true : false;
export const url = __prod__
  ? "https://songbattle-rose.vercel.app"
  : "http://localhost:3000";
export const socketURL = __prod__
  ? "http://localhost:3000"
  : "http://localhost:3000";
export const generateId = (): String => {
  return uuidv4();
};
export const parseCookies = (req) => {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
};
