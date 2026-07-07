"use client";

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">

      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow">

        <h1 className="text-2xl font-bold text-center mb-2 text-black dark:text-white">
          Hotel Experience Survey
        </h1>

        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
          Share your experience and help us improve our service.
        </p>

        <button
          onClick={() => router.push("/survey")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
        >
          Start Survey
        </button>

      </div>

    </div>
  );

}