import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetch from "../../../libs/fetch";
import { url } from "../../consts";

export default function Home() {
  const router = useRouter();
  const roomId = typeof window !== "undefined" ? router.query.roomId : "0";
  const { data, error } = useSWR<{ info: number }>(
    url + "/api/song/amount/" + roomId,
    fetch,
    { refreshInterval: 12 }
  );
  return (
    <div className={styles.container}>
      <Head>
        <title>Songbattle - Waiting for songs...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            {data ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {data.info}
              </p>
            ) : (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Loading...
              </p>
            )}
            <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Waiting for songs...
            </p>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
