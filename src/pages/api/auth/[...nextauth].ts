import { fauna } from "@/services/fauna";
import NextAuth, { User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { query as q } from "faunadb";
import { AdapterUser } from "next-auth/adapters";

type signInProps = {
  user: User | AdapterUser;
};

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session }: any) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user?.email!)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return { ...session, activeSubscription: userActiveSubscription };
      } catch (error) {
        return { ...session, activeSubscription: null };
      }
    },
    async signIn({ user }: signInProps) {
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email!))
              )
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email!)))
          )
        );

        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);
