import { CookiesProvider } from "react-cookie";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <Component {...pageProps} />
    </CookiesProvider>
  );
}

export default MyApp;
