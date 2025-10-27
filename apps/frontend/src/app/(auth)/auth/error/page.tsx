"use client";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");
  return (
    <div className="max-w-md mx-auto">
      <div className="card"><div className="card-body">
        <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
        <p className="text-red-600 text-sm">{error || "Something went wrong."}</p>
      </div></div>
    </div>
  );
}


