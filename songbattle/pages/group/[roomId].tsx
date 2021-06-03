import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetcher from "../../utils/fetch";
import { url } from "../../utils/consts";
import swal from "sweetalert";
import { useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";

export default function Home({ roomId }) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);

  /*if (!exist) {
    swal({
      icon: "error",
      text: "The Room does not exist",
      title: "Room not found",
    });
    router.push("/");
  }*/

  useEffect(() => {
    const socket = socketIOClient("http://localhost:8080", {
      transports: ["websocket"],
    });
  });

  const { data, error } = useSWR<{ info: number }>(
    url + "/api/song/amount/" + roomId,
    fetcher,
    { refreshInterval: 30 }
  );
  return (
    <div className="dark:bg-gray-800">
      <Head>
        <title>Songbattle - Waiting for songs...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
        <div className="max-w-md w-full space-y-8">
          <div>
            {data ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {data.info}
              </p>
            ) : (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Loading...
              </p>
            )}
            <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
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
                if (data.info >= 2 && data.info % 2 === 0) {
                  router.push("/room/play/" + roomId);
                } else if (data.info >= 2 && !(data.info % 2 === 0)) {
                  swal({
                    icon: "error",
                    text: "There has to be a number of songs in the queue that is divisible by 2",
                    title: "Not enough songs in queue",
                  });
                } else {
                  swal({
                    icon: "error",
                    text: "There has to be more then 2 songs in the Queue to start...",
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
  /*const res = await fetch(
    `${url}/api/room/exist/` + ctx.query.roomId + "/secure",
    {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "get",
    }
  );

  const result = await res.json();
  if (!result.exist && ctx.res) {
    ctx.res.writeHead(301, { Location: "/" });
    ctx.res.end();
  }*/

  return { roomId: ctx.query.roomId };
};
