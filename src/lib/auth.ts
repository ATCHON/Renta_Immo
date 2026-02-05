import { betterAuth } from "better-auth";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined"); // Fail fast if env var is missing
}

const dbUrl = process.env.DATABASE_URL;
console.log("DB Connection Attempt:", {
    urlLength: dbUrl.length,
    startsTo: dbUrl.substring(0, 15),
    isLocalhost: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1"),
    envKeys: Object.keys(process.env).filter(k => k.includes("PG") || k.includes("DB"))
});

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});
