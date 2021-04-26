import Head from "next/head";
import styles from "../styles/Home.module.css";
import { url } from "../utils/consts";
import { useRouter } from "next/router";

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

  return (
    <div className={styles.container}>
      <Head>
        <title>Songbattle - Create a Room</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
