import { Header } from "@/components/Header";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

import "../styles/global.scss";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
