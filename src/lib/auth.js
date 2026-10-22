import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error(
    "MONGO_URI is not set. Add it in Vercel project environment variables."
  );
}

const client = new MongoClient(mongoUri);
const db = client.db("toolify3d");

const googleClientId = process.env.OAUTH_CLIENT_ID;
const googleClientSecret = process.env.OAUTH_CLIENT_SECRET;
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Dev: log reset link. Swap for Resend/Nodemailer later.
      console.info(`[password-reset] ${user.email} → ${url}`);
    },
  },
  ...(socialProviders ? { socialProviders } : {}),
});
