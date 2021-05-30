import { CookiesProvider } from "react-cookie";
import Router from "next/router";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import NProgress from "nprogress";

Router.events.on("routeChangeStart", (url) => {
  console.log(`Loading: ${url}`);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <Head>
        <link rel="stylesheet" type="text/css" href="/nprogress.css" />
      </Head>
      <Component {...pageProps} />
    </CookiesProvider>
  );
}

export default MyApp;
