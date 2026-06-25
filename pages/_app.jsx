import "../styles/globals.css";
import Head from "next/head";
import { Provider } from "react-redux";
import { store } from "../store";
import { useEffect } from "react";
import { startTokenRefreshInterval, stopTokenRefreshInterval } from "../services/authService";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    startTokenRefreshInterval();
    return () => stopTokenRefreshInterval();
  }, []);

  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Leddar Brand Panel</title>
        <link rel="icon" type="image/jpeg" href="/favicon.jpeg" />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
