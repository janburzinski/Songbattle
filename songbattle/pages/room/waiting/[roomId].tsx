import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function Home({ songCount }) {
  const router = useRouter();
  const { roomId } = router.query;
  const { data, error } = useSWR(
    "https://songbattle-rose.vercel.app/api/song/amount/" + roomId,
    fetch
  );
  return (
    <div className={styles.container}>
      <Head>
        <title>Songbattle - Waiting for songs...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <p className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {data}
            </p>
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
