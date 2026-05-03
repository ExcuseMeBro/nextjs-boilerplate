import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:8000/api"),
  API_BASE_URL: z.url().optional(),
  AUTH_LOGIN_PATH: z.string().default("/auth/login"),
  AUTH_REFRESH_PATH: z.string().default("/auth/refresh"),
  AUTH_ME_PATH: z.string().default("/auth/me"),
  AUTH_ACCESS_COOKIE: z.string().default("access_token"),
  AUTH_REFRESH_COOKIE: z.string().default("refresh_token"),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  isProduction: parsedEnv.NODE_ENV === "production",
  publicApiBaseUrl: parsedEnv.NEXT_PUBLIC_API_BASE_URL,
  serverApiBaseUrl: parsedEnv.API_BASE_URL ?? parsedEnv.NEXT_PUBLIC_API_BASE_URL,
  auth: {
    loginPath: parsedEnv.AUTH_LOGIN_PATH,
    refreshPath: parsedEnv.AUTH_REFRESH_PATH,
    mePath: parsedEnv.AUTH_ME_PATH,
    accessCookie: parsedEnv.AUTH_ACCESS_COOKIE,
    refreshCookie: parsedEnv.AUTH_REFRESH_COOKIE,
  },
};
