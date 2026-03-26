import type { User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      username: string;
      xp: number;
    };
  }
}
