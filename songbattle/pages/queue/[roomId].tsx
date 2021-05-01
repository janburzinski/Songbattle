import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import { url } from "../../utils/consts";
import swal from "sweetalert";

export default function Queue({ exist }) {
  const router = useRouter();
  const { roomId } = router.query;

  if (!exist) {
    swal({
      icon: "error",
      text: "The Room does not exist",
      title: "Room not found",
      buttons: [false],
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
  }

  const addSong = async (e) => {
    e.preventDefault();

    if (!exist) {
      swal({
        icon: "error",
        text: "The Room does not exist",
        title: "Room not found",
      });
      return;
    }

    const songLink = e.target.songlink.value;

    if (!songLink.includes("https://open.spotify.com/track/")) {
      swal({
        icon: "error",
        text: "The Songlink needs to be a Spotify Link",
        title: "Songlink not from Spotify",
      });
      return;
    }

    const res = await fetch(`${url}/api/song/add`, {
      body: JSON.stringify({
        songlink: songLink,
        id: roomId,
        username: e.target.username.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    });

    /**
     * Add Cookie to the browser
     * Check if the URL is an actual spotify url
     */

    const result = await res.json();
    if (result.added === true) {
      swal({
        icon: "success",
        text: "The Song has been successfully added",
        title: "Successfully added the Song",
      });
    } else {
      swal({
        icon: "error",
        text: result.message,
        title: "Error while adding the Song",
      });
    }
  };

  return (
    <div className="dark:bg-gray-800">
      <Head>
        <title>Songbattle - {roomId}</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Add a Song
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              Room Id: {roomId}
            </p>
          </div>
          <form
            className="mt-8 space-y-6"
            action="#"
            onSubmit={addSong}
            method="POST"
          >
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="songlink" className="sr-only">
                  Sonnglink
                </label>
                <input
                  id="songlink"
                  name="songlink"
                  type="text"
                  autoComplete="songlink"
                  required
                  className="dark:bg-gray-800 dark:text-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Songlink"
                />
              </div>
              <br />
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="dark:bg-gray-800 dark:text-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ADD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Queue.getInitialProps = async (ctx) => {
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
