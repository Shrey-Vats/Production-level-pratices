"use client"
import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button
        className="bg-blue-800 rounded-md drop-shadow-sm px-4 py-2 text-white m-5 hover:bg-blue-900 hover:scale-105 focus:scale-95 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 drop-shadow-indigo-600 hover:drop-shadow-none hover:shadow-2xl font-semibold"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </>
  );
}
