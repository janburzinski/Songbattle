import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetcher from "../../../utils/fetch";
import { url } from "../../../utils/consts";
import swal from "sweetalert";

export default function Home({ exist }) {
  const router = useRouter();
  const roomId = typeof window !== "undefined" ? router.query.roomId : "0";

  if (!exist) {
    swal({
      icon: "error",
      text: "The Room does not exist",
      title: "Room not found",
    });
    router.push("/");
  }

  const { data, error } = useSWR<{ info: number }>(
    url + "/api/song/amount/" + roomId,
    fetcher,
    { refreshInterval: 30 }
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
            <a
              href={url + "/queue/" + roomId}
              className="mt-6 text-center text-1xl font-extrabold text-gray-400"
            >
              {url + "/queue/" + roomId}
            </a>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                if (data.info >= 2) {
                  router.push("/room/play/" + roomId);
                } else {
                  swal({
                    icon: "error",
                    text:
                      "There has to be more then 2 songs in the Queue to start...",
                    title: "Not enough songs in queue",
                  });
                }
              }}
            >
              START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Home.getInitialProps = async (ctx) => {
  const res = await fetch(`${url}/api/room/exist/` + ctx.query.roomId, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "get",
  });

  const result = await res.json();
  return {
    exist: result.exist,
  };
};
