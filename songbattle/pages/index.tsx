import Head from "next/head";
import { generateId, url } from "../utils/consts";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();

  const createRoom = async (e) => {
    e.preventDefault();

    const res = await fetch(`${url}/api/room/create`, {
      body: JSON.stringify({ owner: e.target.username.value }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    });

    /**
     * Add Cookie to the browser
     */

    const result = await res.json();
    router.push("/room/waiting/" + result.id);
  };

  const startFreeplay = async (e) => {
    e.preventDefault();

    const res = await fetch(`${url}/api/room/freeplay/start`, {
      body: JSON.stringify({
        owner: "freeplay-" + generateId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    });

    /**
     * Add Cookie to the browser
     */

    const result = await res.json();
    console.log(result.id);
    router.push("/room/play/" + result.id);
  };

  return (
    <div className="dark:bg-gray-800">
      <Head>
        <title>Songbattle - Create a Room</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Create a Room
            </h2>
          </div>
          <form
            className="mt-8 space-y-6"
            action="#"
            onSubmit={createRoom}
            method="POST"
          >
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
                className="dark:bg-gray-800 dark:text-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                CREATE
              </button>
              <br />
              <button
                onClick={startFreeplay}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                FREEPLAY
              </button>
            </div>
          </form>
        </div>
      </div>
      <footer className={styles.footer}>
        <a
          href="https://github.com/Urento/Songbattle"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/GitHub-Mark-Light-120px-plus.png"
            alt="Github Logo"
            className={styles.logo}
          />
        </a>
      </footer>
    </div>
  );
}
