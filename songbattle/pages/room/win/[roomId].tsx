import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetch from "../../../utils/fetch";
import { url } from "../../../utils/consts";

export default function Home() {
  const router = useRouter();
  const roomId = typeof window !== "undefined" ? router.query.roomId : "0";
  const { data, error } = useSWR<{ info: any[] }>(
    url + "/api/song/queue/" + roomId,
    fetch
  );
  let songLink = "";
  if (data) {
    songLink = data.info[0].songlink.replace(
      "https://open.spotify.com/track/",
      ""
    );
  }

  const playAgain = () => {
    router.push("../../../");
    return;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Songbattle - WINNER</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              WINNER!!!!!
            </h1>
            {data ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                <iframe
                  src={"https://open.spotify.com/embed/track/" + songLink}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                ></iframe>
              </p>
            ) : (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Loading...
              </p>
            )}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={playAgain}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
