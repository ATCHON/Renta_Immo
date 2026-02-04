import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
    database: {
        db: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
        type: "postgres",
    },
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
