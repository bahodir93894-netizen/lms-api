import { ConvexHttpClient } from "convex/browser";
import { config } from "./config.js";

class ConvexClientSingleton {
  private static _instance: ConvexHttpClient | null = null;
  static getInstance(): ConvexHttpClient {
    if (!ConvexClientSingleton._instance) {
      ConvexClientSingleton._instance = new ConvexHttpClient(config.convexUrl);
    }
    return ConvexClientSingleton._instance;
  }
  static reset(): void { ConvexClientSingleton._instance = null; }
}

export const getConvexClient = ConvexClientSingleton.getInstance.bind(ConvexClientSingleton);

export function convexQuery(name: string, args: Record<string, unknown> = {}, token?: string) {
  const client = getConvexClient();
  return token ? client.query(name, args, { token }) : client.query(name, args);
}

export function convexMutation(name: string, args: Record<string, unknown> = {}, token?: string) {
  const client = getConvexClient();
  return token ? client.mutation(name, args, { token }) : client.mutation(name, args);
}