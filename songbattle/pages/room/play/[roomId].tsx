import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetcher from "../../../utils/fetch";
import { url } from "../../../utils/consts";

export default function Home({ roomId }) {
  const router = useRouter();
  //  const roomId =
  //    typeof window !== "undefined" ? router.query.roomId : "345345345345";
  const { data, error } = useSWR<{ info: any[] }>(
    url + "/api/song/queue/" + roomId,
    fetcher
  );
  let songLink1 = "https://open.spotify.com/embed/track/1pGlbknNqHchwYzHh3ffJj";
  let songLink2 = "https://open.spotify.com/embed/track/1pGlbknNqHchwYzHh3ffJj";

  if (data) {
    songLink1 = data.info[0].songlink.replace(
      "https://open.spotify.com/track/",
      ""
    );
    songLink2 =
      data.info[1] !== null
        ? data.info[1].songlink.replace("https://open.spotify.com/track/", "")
        : "";
  }

  const voteForSong1 = async (e) => {
    e.preventDefault();

    const s2 = data.info[1];

    const res = await fetch(`${url}/api/song/remove`, {
      body: JSON.stringify({ songlink: s2.songlink, id: roomId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "delete",
    });

    const result = await res.json();
    if (result.message === "Room or song not found") {
      router.reload();
      return;
    }
    if (result.songCount <= 1) {
      router.push("/room/win/" + roomId);
      return;
    }
    router.reload();
  };

  const voteForSong2 = async (e) => {
    e.preventDefault();

    const s1 = data.info[0];

    const res = await fetch(`${url}/api/song/remove`, {
      body: JSON.stringify({ songlink: s1.songlink, id: roomId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    });

    const result = await res.json();
    if (result.songCount <= 1) {
      //delete room
      router.push("/room/win/" + roomId);
      return;
    }
    router.push("/room/play/" + roomId);
  };

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
        <title>Songbattle - Playing</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
        <div className="max-w-md w-full space-y-8">
          <div>
            {data ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                <iframe
                  src={"https://open.spotify.com/embed/track/" + songLink1}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                ></iframe>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={voteForSong1}
                >
                  VOTE
                </button>
                <br />
                <iframe
                  src={"https://open.spotify.com/embed/track/" + songLink2}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                ></iframe>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={voteForSong2}
                >
                  VOTE
                </button>
              </p>
            ) : (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Loading...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const { roomId } = ctx.query;
  return {
    props: {
      roomId,
    },
  };
};
