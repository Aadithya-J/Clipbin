"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface ClipData {
  id: string;
  content: string;
  slug: string;
  isPrivate: boolean;
  expiresAt: string | null;
  createdAt: string;
  views: number;
}

export default function ViewClipPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const passwordParam = searchParams.get("password");

  const [clip, setClip] = useState<ClipData | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchClip = async () => {
      try {
        setIsLoading(true);
        setError("");

        const url = new URL(`/api/clips/${slug}`, window.location.origin);
        if (passwordParam) {
          url.searchParams.set("password", passwordParam);
        }

        const response = await fetch(url.toString());

        if (response.status === 401) {
          setIsPasswordPromptOpen(true);
          setIsLoading(false);
          return;
        }

        if (response.status === 403) {
          setError("Incorrect password");
          setIsPasswordPromptOpen(true);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch clip");
        }

        const data = await response.json();
        setClip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClip();
  }, [slug, passwordParam]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    try {
      setIsLoading(true);
      setError("");

      const url = new URL(`/api/clips/${slug}`, window.location.origin);
      url.searchParams.set("password", password);

      const response = await fetch(url.toString());

      if (response.status === 403) {
        setError("Incorrect password");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch clip");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setClip(data);
      setIsPasswordPromptOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-intense p-8 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin w-8 h-8 border-2 border-[#00FFE0] border-t-transparent rounded-full"></div>
            <span className="text-white font-mono">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isPasswordPromptOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-intense p-8 rounded-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  if (isPasswordPromptOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFE0]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#9E6CFF]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="glass-intense p-8 rounded-2xl max-w-md w-full relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00FFE0] to-[#9E6CFF] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Password Required
            </h1>
            <p className="text-white/70">This clip is password protected</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Enter Password
              </label>
              <input
                type="password"
                className="w-full bg-[#0D1117]/80 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 font-mono transition-all duration-300 focus:border-[#00FFE0] focus:ring-0 focus:outline-none focus:shadow-lg focus:shadow-[#00FFE0]/20"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#00FFE0] to-[#9E6CFF] text-black font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 neon-glow"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "View Clip"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!clip) return null;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="glass-intense p-6 rounded-2xl mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00FFE0] to-[#9E6CFF] rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-mono">
                  {clip.slug}
                </h1>
                <p className="text-white/60 text-sm">
                  Created {new Date(clip.createdAt).toLocaleDateString()} at{" "}
                  {new Date(clip.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00FFE0]">
                  {clip.views}
                </div>
                <div className="text-xs text-white/60">VIEWS</div>
              </div>

              {clip.expiresAt && (
                <div className="text-center">
                  <div className="text-sm font-mono text-[#A3FF12]">
                    {new Date(clip.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-white/60">EXPIRES</div>
                </div>
              )}

              {clip.isPrivate && (
                <div className="flex items-center space-x-2 bg-[#9E6CFF]/20 px-3 py-1 rounded-full">
                  <svg
                    className="w-3 h-3 text-[#9E6CFF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-xs text-white/80 font-medium">
                    PRIVATE
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-intense overflow-hidden rounded-2xl">
          <div className="bg-[#0D1117] border-b border-white/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-white/60 text-sm font-mono">
                clipboard.txt
              </span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(clip.content)}
              className="flex items-center space-x-2 text-white/60 hover:text-[#00FFE0] transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-mono">COPY</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-[#0D1117] p-6 text-white font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
              <code>{clip.content}</code>
            </pre>

            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-[#00FFE0] via-[#9E6CFF] to-[#A3FF12] opacity-50"></div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 glass rounded-lg text-white/80 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gradient-to-r from-[#00FFE0] to-[#9E6CFF] text-black font-bold rounded-lg transition-all duration-300 hover:scale-105 neon-glow"
          >
            Create New Clip
          </button>
        </div>
      </div>
    </div>
  );
}
