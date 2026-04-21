import "../styles/globals.css";
import Head from "next/head";
import { Provider } from "react-redux";
import { store } from "../store";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        {/* Fixes the "viewport meta tags should not be used in _document.js" warning */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Leddar Brand Panel</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
