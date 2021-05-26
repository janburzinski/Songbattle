import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetcher from "../../../utils/fetch";
import { parseCookies, url } from "../../../utils/consts";
import swal from "sweetalert";
import { useCookies } from "react-cookie";

export default function Home({ roomId }) {
  const router = useRouter();
  const [_cookies, _setCookie, removeCookie] = useCookies(["user"]);
  const { data, error } = useSWR<{ info: any[] }>(
    url + "/api/song/queue/" + roomId,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  let songLink = "";
  if (data) {
    songLink = data.info[0].songlink.replace(
      "https://open.spotify.com/track/",
      ""
    );
  }
  let alreadySent = false;

  const sendWinStat = async () => {
    if (!alreadySent) {
      const res = await fetch(`${url}/api/room/win`, {
        body: JSON.stringify({ songUrl: data.info[0].songlink, id: roomId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        method: "post",
      });
      const result = await res.json();
      if (result.updated === false) {
        swal({
          icon: "error",
          text: result.message,
          title: "Error while updating the winning statistic!",
        });
        return;
      }
      alreadySent = true;
    }
  };

  // Delete the room
  const deleteRoom = async () => {
    const res = await fetch(`${url}/api/room/delete`, {
      body: JSON.stringify({ id: roomId }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "delete",
    });

    const result = await res.json();
    if (result.deleted === false) {
      swal({
        icon: "error",
        text: result.message,
        title: "Error while deleting this room!",
      });
      return;
    }
  };
  sendWinStat();
  deleteRoom();

  const playAgain = () => {
    router.push("../../../");
    return;
  };

  removeCookie("user", { path: "/", sameSite: true });

  return (
    <div
      className="dark:bg-gray-800"
      style={{
        minHeight: "100vh",
        padding: "0 0.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Head>
        <title>Songbattle - WINNER</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
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
            <br />
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

Home.getInitialProps = async (ctx) => {
  const { roomId } = ctx.query;
  const cookie = parseCookies(ctx.req);
  if (ctx.res) {
    if (Object.keys(cookie).length === 0 && cookie.constructor === Object) {
      ctx.res.writeHead(301, { Location: "/" });
      ctx.res.end();
    }
  }
  return {
    roomId,
  };
};
