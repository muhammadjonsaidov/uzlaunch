"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

export default function OAuth2Callback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      setError(err === "banned" ? "Your account has been banned." : "OAuth login failed. Please try again.");
      return;
    }
    if (token) {
      setToken(token);
      router.replace("/dashboard");
    } else {
      setError("No token received. Please try again.");
    }
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <h1 className="font-black text-xl text-slate-900 mb-2">Login failed</h1>
          <p className="text-sm text-slate-500 mb-5">{error}</p>
          <a href="/login" className="btn-primary inline-block px-6 py-2.5 text-sm">Back to login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-sm text-slate-500">Signing you in…</p>
      </div>
    </main>
  );
}
