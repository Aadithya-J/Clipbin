'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ClipData {
  id: string;
  content: string;
  slug: string;
  isPrivate: boolean;
  expiresAt: string | null;
  createdAt: string;
  views: number;
}

export default function ViewClipPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clip, setClip] = useState<ClipData | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);

  useEffect(() => {
    const fetchClip = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const url = new URL(`/api/clips/${params.slug}`, window.location.origin);
        const passwordParam = searchParams.get('password');
        if (passwordParam) {
          url.searchParams.set('password', passwordParam);
        }

        const response = await fetch(url.toString());
        
        if (response.status === 401) {
          setIsPasswordPromptOpen(true);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch clip');
        }

        const data = await response.json();
        setClip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClip();
  }, [params.slug, searchParams]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    // Reload the page with the password in the URL
    const url = new URL(window.location.href);
    url.searchParams.set('password', password);
    router.push(url.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isPasswordPromptOpen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <form 
          onSubmit={handlePasswordSubmit}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Private Clip</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">This clip is password protected. Please enter the password to view it.</p>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Clip
          </button>
        </form>
      </div>
    );
  }

  if (!clip) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Clip: {clip.slug}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(clip.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-4">
                {clip.views} {clip.views === 1 ? 'view' : 'views'}
              </span>
              {clip.expiresAt && (
                <span>
                  Expires: {new Date(clip.expiresAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="px-6 py-6">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
              {clip.content}
            </pre>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You might want to show a toast notification here
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy Link
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            ← Create your own clip
          </button>
        </div>
      </div>
    </div>
  );
}
