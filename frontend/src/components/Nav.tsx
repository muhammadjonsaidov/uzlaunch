"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeToken, isLoggedIn } from "@/lib/auth";

export default function Nav() {
  const router = useRouter();

  function logout() {
    removeToken();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white">U</div>
          <span className="text-sm font-black tracking-tight">UZLaunch</span>
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn() ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400">Dashboard</Link>
              <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400">Login</Link>
              <Link href="/register" className="btn-primary text-xs py-2 px-4">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
