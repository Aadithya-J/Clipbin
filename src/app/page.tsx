"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiresIn, setExpiresIn] = useState("1h");
  const [destroyOnView, setDestroyOnView] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter some content");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          isPrivate,
          password: isPrivate ? password : undefined,
          customSlug: customSlug || undefined,
          expiresIn,
          destroyOnView,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create clip");
      }

      const { slug } = await response.json();
      router.push(`/clips/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#00FFE0] via-[#9E6CFF] to-[#A3FF12] bg-clip-text text-transparent">
            ClipBin
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Simple and secure text sharing platform
          </p>
        </div>

        <div className="glass-intense shadow-2xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300FFE0' fill-opacity='0.03'%3E%3Cpath d='M40 40V0H0v40h40zm-20-20a20 20 0 1 1 0-40 20 20 0 0 1 0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <form onSubmit={handleSubmit} className="p-8 relative z-10">
            <div className="mb-8">
              <label className="flex items-center text-sm font-semibold text-white/90 mb-3">
                <span className="w-2 h-2 bg-[#00FFE0] rounded-full mr-2"></span>
                Your Text
              </label>
              <div className="relative group">
                <textarea
                  id="content"
                  rows={12}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl p-6 text-white font-mono text-sm leading-relaxed resize-none transition-all duration-300 group-hover:border-[#00FFE0]/30 focus:border-[#00FFE0] focus:ring-0 focus:outline-none"
                  placeholder="// Paste your text here..."
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  required
                />
                <div className="absolute top-4 right-4 text-white/30 text-xs font-mono">
                  {content.length} chars
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <label className="flex items-center text-sm font-semibold text-white/90">
                  <span className="w-2 h-2 bg-[#9E6CFF] rounded-full mr-2"></span>
                  Security Level
                </label>
                <div className="space-y-3">
                  <div
                    className="glass p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10"
                    onClick={() => setIsPrivate(false)}
                  >
                    <div className="flex items-center">
                      <input
                        id="public"
                        name="visibility"
                        type="radio"
                        className="h-4 w-4 text-[#00FFE0] focus:ring-[#00FFE0] border-white/30 bg-transparent"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                      />
                      <label
                        htmlFor="public"
                        className="ml-3 text-white/90 font-medium"
                      >
                        Public Access
                      </label>
                    </div>
                    <p className="text-xs text-white/60 ml-7 mt-1">
                      Anyone with the link can view
                    </p>
                  </div>
                  <div
                    className="glass p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10"
                    onClick={() => setIsPrivate(true)}
                  >
                    <div className="flex items-center">
                      <input
                        id="private"
                        name="visibility"
                        type="radio"
                        className="h-4 w-4 text-[#00FFE0] focus:ring-[#00FFE0] border-white/30 bg-transparent"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                      />
                      <label
                        htmlFor="private"
                        className="ml-3 text-white/90 font-medium"
                      >
                        Password Protected
                      </label>
                    </div>
                    <p className="text-xs text-white/60 ml-7 mt-1">
                      Requires password to access
                    </p>
                  </div>
                </div>

                {isPrivate && (
                  <div className="mt-4">
                    <input
                      type="password"
                      id="password"
                      className="w-full bg-[#0D1117]/80 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-[#9E6CFF] focus:ring-0 focus:outline-none"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      required={isPrivate}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-white/90 mb-3">
                    <span className="w-2 h-2 bg-[#A3FF12] rounded-full mr-2"></span>
                    Custom URL
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-white/20">
                    <span className="bg-[#0D1117]/80 px-4 py-3 text-white/60 text-sm font-mono border-r border-white/20">
                      clipbin.dev/
                    </span>
                    <input
                      type="text"
                      id="customSlug"
                      className="flex-1 bg-[#0D1117]/80 px-4 py-3 text-white placeholder-white/40 font-mono text-sm focus:ring-0 focus:outline-none"
                      placeholder="my-text-snippet"
                      value={customSlug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCustomSlug(
                          e.target.value.replace(/[^a-zA-Z0-9_-]/g, "")
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-white/90 mb-3">
                    <span className="w-2 h-2 bg-[#A3FF12] rounded-full mr-2"></span>
                    Expiration
                  </label>
                  <select
                    id="expiresIn"
                    className="w-full bg-[#0D1117]/80 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#A3FF12] focus:ring-0 focus:outline-none"
                    value={expiresIn}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setExpiresIn(e.target.value)
                    }
                  >
                    <option value="1h">1 Hour</option>
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-white/90 mb-3">
                    <span className="w-2 h-2 bg-[#A3FF12] rounded-full mr-2"></span>
                    Destroy when read
                  </label>
                  <div
                    className="flex items-center justify-between glass p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10"
                    onClick={() => setDestroyOnView(!destroyOnView)}
                  >
                    <div>
                      <label
                        htmlFor="destroyOnView"
                        className="text-white/90 font-medium"
                      >
                        View Once
                      </label>
                      <p className="text-xs text-white/60 mt-1">
                        Public clips are deleted after the second view, private
                        clips after the first.
                      </p>
                    </div>
                    <input
                      id="destroyOnView"
                      name="destroyOnView"
                      type="checkbox"
                      className="h-5 w-5 text-[#00FFE0] focus:ring-[#00FFE0] border-white/30 bg-transparent rounded"
                      checked={destroyOnView}
                      onChange={(e) => setDestroyOnView(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-300 font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-gradient-to-r from-[#00FFE0] to-[#9E6CFF] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 neon-glow"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
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
                    Creating...
                  </span>
                ) : (
                  "Create Clip"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">Simple • Fast • Secure</p>
        </div>
      </div>
    </div>
  );
}
