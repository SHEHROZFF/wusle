import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

// Extend NextAuth types to include additional fields on the session user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      wuslePurchased: number;
      spent: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    wuslePurchased?: number;
    spent?: number;
  }
}

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    error: "/auth/error", // Custom error page
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Missing email or password");
        }
        // Find user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Invalid credentials");
        }
        // Verify password
        const isValid = await compare(credentials.password, user.password!);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          wuslePurchased: user.wuslePurchased,
          spent: user.spent,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Upsert user: Create or update user info from Google sign-in
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                wuslePurchased: 0, // Default value for new users
                spent: 0, // Default value for new users
              },
            });
          } else {
            // Optional: update the name if it's changed
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
              },
            });
          }
        } catch (err) {
          console.error("Google sign-in error:", err);
          return "/auth/error?error=" + encodeURIComponent(String(err));
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Fetch the latest user data from the database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            email: true,
            name: true,
            wuslePurchased: true,
            spent: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.wuslePurchased = dbUser.wuslePurchased;
          token.spent = dbUser.spent;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id!,
          email: token.email!,
          name: token.name,
          image: session.user.image, // Retain existing image if any
          wuslePurchased: token.wuslePurchased ?? 0, // Default value to avoid undefined
          spent: token.spent ?? 0, // Default value to avoid undefined
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };








// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaClient } from "@prisma/client";
// import { compare } from "bcrypt";

// // Extend NextAuth types to include "id" on the session user and JWT
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//     };
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     name?: string | null;
//     email?: string | null;
//   }
// }

// const prisma = new PrismaClient();

// const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: "jwt" },
//   pages: {
//     error: "/auth/error", // custom error page
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
//       authorization: {
//         params: {
//           prompt: "select_account"
//         }
//       }
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials || !credentials.email || !credentials.password) {
//           throw new Error("Missing email or password");
//         }
//         // Find user
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });
//         if (!user) {
//           throw new Error("Invalid credentials");
//         }
//         // Check password
//         const isValid = await compare(credentials.password, user.password!);
//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }
//         return { id: user.id, email: user.email, name: user.name };
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         try {
//           // Upsert user: Create or update user info from Google sign-in
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           });
//           if (!existingUser) {
//             await prisma.user.create({
//               data: {
//                 email: user.email!,
//                 name: user.name || "",
//                 // password: not required for OAuth users
//               },
//             });
//           } else {
//             // Optional: update the name if it's changed
//             await prisma.user.update({
//               where: { email: user.email! },
//               data: {
//                 name: user.name || existingUser.name,
//               },
//             });
//           }
//         } catch (err) {
//           console.error("Google signIn error:", err);
//           // Redirect to error page with the error message
//           return "/auth/error?error=" + encodeURIComponent(String(err));
//         }
//       }
//       return true; // Continue with sign-in
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id!,
//           email: token.email!,
//           name: token.name,
//           image: session.user.image, // retain existing image if any
//         };
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };







// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaClient } from "@prisma/client";
// import { compare } from "bcrypt";

// const prisma = new PrismaClient();

// const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: "jwt" },
//   pages: {
//     error: "/auth/error", // custom error page
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials || !credentials.email || !credentials.password) {
//           throw new Error("Missing email or password");
//         }
//         // Find user
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });
//         if (!user) {
//           throw new Error("Invalid credentials");
//         }
//         // Check password
//         const isValid = await compare(credentials.password, user.password!);
//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }
//         return { id: user.id, email: user.email, name: user.name };
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         try {
//           // Upsert user
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           });
//           if (!existingUser) {
//             await prisma.user.create({
//               data: {
//                 email: user.email!,
//                 name: user.name || "",
//                 // password: optional for OAuth users
//               },
//             });
//           } else {
//             // Optional: update name
//             await prisma.user.update({
//               where: { email: user.email! },
//               data: {
//                 name: user.name || existingUser.name,
//               },
//             });
//           }
//         } catch (err) {
//           console.error("Google signIn error:", err);
//           // redirect to error page
//           return "/auth/error?error=" + encodeURIComponent(String(err));
//         }
//       }
//       return true; // Continue with sign-in
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           email: token.email,
//           name: token.name,
//         };
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };








// // app/api/auth/[...nextauth]/route.ts
// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaClient } from "@prisma/client";
// import { compare } from "bcrypt";

// const prisma = new PrismaClient();

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: "jwt" },
//   pages: {
//     error: "/auth/error", // custom error page
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials || !credentials.email || !credentials.password) {
//           throw new Error("Missing email or password");
//         }
//         // Find user
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });
//         if (!user) {
//           throw new Error("Invalid credentials");
//         }
//         // Check password
//         const isValid = await compare(credentials.password, user.password!);
//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }
//         return { id: user.id, email: user.email, name: user.name };
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       if (account.provider === "google") {
//         try {
//           // Upsert user
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email! },
//           });
//           if (!existingUser) {
//             await prisma.user.create({
//               data: {
//                 email: user.email!,
//                 name: user.name || "",
//                 // password: undefined if optional, or:
//                 // password: "google-oauth-user"
//               },
//             });
//           } else {
//             // Optional: update name
//             await prisma.user.update({
//               where: { email: user.email! },
//               data: {
//                 name: user.name || existingUser.name,
//               },
//             });
//           }
//         } catch (err) {
//           console.error("Google signIn error:", err);
//           // redirect to error page
//           return "/auth/error?error=" + encodeURIComponent(String(err));
//         }
//       }
//       return true; // Continue with sign-in
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           email: token.email,
//           name: token.name,
//         };
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };











// // app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth";
// import { PrismaClient } from "@prisma/client";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcrypt";

// const prisma = new PrismaClient();

// const handler = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET, // Set in your .env
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "name@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials, req) {
//         if (!credentials?.email || !credentials.password) {
//           throw new Error("Missing email or password");
//         }

//         // Find user by email
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });
//         if (!user) {
//           throw new Error("Invalid credentials");
//         }

//         // Check password
//         const isValid = await compare(credentials.password, user.password);
//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }

//         // Return user object
//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           email: token.email,
//           name: token.name,
//         };
//       }
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };
