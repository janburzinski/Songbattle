import Head from "next/head";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import fetcher from "../../../utils/fetch";
import { parseCookies, url } from "../../../utils/consts";
import { useState } from "react";

export default function Home({ roomId }) {
  const router = useRouter();
  const [processingVote, setProcessingVote] = useState(false);
  const [songCount, setSongCount] = useState(0);
  const apiURL = `${url}/api/song/queue/${roomId}`;
  // i know its dumb to use swr then but im too lazy to change it to normal fetch
  const { data, error } = useSWR<{ info: any[] }>(apiURL, fetcher, {
    refreshInterval: 0,
  });
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
    setProcessingVote(true);

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
      mutate(apiURL);
      setProcessingVote(false);
      return;
    }
    if (result.songCount <= 1) {
      router.push("/room/win/" + roomId);
      return;
    }
    setProcessingVote(false);
    setSongCount(result.songCount);
    mutate(apiURL);
  };

  const voteForSong2 = async (e) => {
    e.preventDefault();
    setProcessingVote(true);

    const s1 = data.info[0];

    const res = await fetch(`${url}/api/song/remove`, {
      body: JSON.stringify({ songlink: s1.songlink, id: roomId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "delete",
    });

    const result = await res.json();
    if (result.message === "Room or song not found") {
      mutate(apiURL);
      return;
    }
    if (result.songCount <= 1) {
      router.push("/room/win/" + roomId);
      return;
    }
    setProcessingVote(false);
    setSongCount(result.songCount);
    mutate(apiURL);
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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              {songCount != 0 ? `Songs in Queue: ${songCount}` : ""}
            </h2>
          </div>
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
            {processingVote ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Processing Vote...
              </p>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Home.getInitialProps = async (ctx) => {
  const { roomId } = ctx.query;
  const cookie = parseCookies(ctx.req);

  //check if the cookie is valid and redirect if not
  const res = await fetch(`${url}/api/room/exist/` + roomId + "/secure", {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "get",
  });

  const result = await res.json();
  if (!result.exist && ctx.res && !(typeof window === "undefined")) {
    ctx.res.writeHead(301, { Location: "/" });
    ctx.res.end();
  }

  return {
    roomId,
  };
};
