import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any): Promise<any> {
        dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.indentifier },
            ],
          });

          if (!user) {
            throw new Error("User not found");
          }
          if (user.isVerified === false) {
            throw new Error("User is not verified");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordMatch) {
            throw new Error("Invalid password");
          }

          return user;
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
      async jwt({ token, user }) {
        if (user) {
            token._id = user._id?.toString();
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            token.isVerified = user.isVerified,
            token.isAcceptingMessage = user.isAcceptingMessage,
            token.username = user.username
        }
        return token;
      },
    async session({ session, token }) {
        if(token){
            session.user._id = token._id;
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessage = token.isAcceptingMessage;
            session.user.username = token.username
        }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECREAT,
};