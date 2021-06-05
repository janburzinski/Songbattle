import Head from "next/head";
import { generateId, url } from "../utils/consts";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { useState } from "react";
import swal from "sweetalert";

export default function Home() {
  const router = useRouter();
  const [cookie, setCookie] = useCookies(["user"]);
  const [loading, setLoading] = useState(false);
  const [groupMode, setGroupMode] = useState(false);

  const updateLoadingState = () => {
    setLoading(!loading);
  };

  const handleGroupModeChange = (e) => {
    setGroupMode(e.target.checked);
  };

  const createRoom = async (e) => {
    e.preventDefault();
    const username: string = e.target.username.value;
    if (username === null || username === "") {
      swal({
        icon: "error",
        text: "Username can not be null",
        title: "Username has to be entered!",
      });
      return;
    }

    if (username.toLowerCase().includes("drop table")) {
      swal({
        icon: "error",
        text: "All Tables were dropped :(",
        title: "EVERYTHING WAS DELETED",
      });
      return;
    }

    updateLoadingState();
    if (!groupMode) {
      const res = await fetch(`${url}/api/room/create`, {
        body: JSON.stringify({ owner: username }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
      });
      const result = await res.json();
      if (result != null) updateLoadingState();
      setCookie("user", result.secretId, {
        path: "/",
        maxAge: 3600, //should be 1 hours or something like that
        sameSite: true,
      });
      router.push("/room/waiting/" + result.id);
    } else {
      const res = await fetch(`${url}/api/group/create`, {
        body: JSON.stringify({ owner: username }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "post",
      });
      const result = await res.json();
      if (result != null) updateLoadingState();
      setCookie("user", result.secretId, {
        path: "/",
        maxAge: 3600, //should be 1 hours or something like that
        sameSite: true,
      });
      router.push("/group/" + result.id);
    }
  };

  const startFreeplay = async (e) => {
    e.preventDefault();
    updateLoadingState();
    const id = generateId();

    const res = await fetch(`${url}/api/room/freeplay/start`, {
      body: JSON.stringify({
        owner: "freeplay-" + id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    });

    const result = await res.json();
    if (result != null) updateLoadingState();
    // Add Cookie for auth
    setCookie("user", result.secretId, {
      path: "/",
      maxAge: 3600, //should be 1 hours or something like that
      sameSite: true,
    });
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
            {loading ? (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Creating the Room...
              </h2>
            ) : (
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Create a Room
              </h2>
            )}
          </div>
          {!loading ? (
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
                  className="dark:bg-gray-800 dark:text-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <div className="flex flex-row">
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    CREATE
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    onClick={startFreeplay}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    FREEPLAY
                  </button>
                </div>
                <br />
                <button
                  type="button"
                  onClick={() => {
                    router.push("/stats");
                  }}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  LEADERBOARD
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="comments"
                      name="comments"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      defaultChecked={groupMode}
                      onChange={handleGroupModeChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="comments"
                      className="font-medium text-white"
                    >
                      Group Mode
                    </label>
                    <p className="text-gray-200">
                      Play with other people and vote together!
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
