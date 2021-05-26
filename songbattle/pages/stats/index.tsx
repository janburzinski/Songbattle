import Head from "next/head";
import { url } from "../../utils/consts";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { useState } from "react";

export default function Stats({ stats }) {
  const router = useRouter();
  const [cookie, setCookie] = useCookies(["user"]);
  const [loading, setLoading] = useState(true);

  const updateLoadingState = () => {
    setLoading(!loading);
  };

  return (
    <div className="dark:bg-gray-800">
      <Head>
        <title>Songbattle - Stats</title>
      </Head>
      <div className="min-h-screen flex justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Stats
            </h2>
          </div>
          <div className="flex flex-col">
            <div className="-my-2 sm:-mx-6 lg:-mx-20">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Songname
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Wins
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.map((stat) => (
                        <tr key={stat.songname}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={stat.cover_img}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {stat.songname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {stat.artist}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.wins}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              router.push("/");
            }}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            BACK TO HOMEPAGE
          </button>
        </div>
      </div>
    </div>
  );
}

Stats.getInitialProps = async (_ctx) => {
  const res = await fetch(`${url}/api/room/stats`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "get",
  });
  const stats = await res.json();
  return {
    stats: stats.info,
  };
};
