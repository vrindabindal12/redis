'use client';

import { useState, useEffect } from 'react';

type UrlEntry = {
  shortId: string;
  originalUrl: string;
  shortUrl: string;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [urls, setUrls] = useState<UrlEntry[]>([]);

  // Fetch all URLs on component mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      const data = await response.json();
      if (response.ok) {
        setUrls(data);
      } else {
        setError(data.error || 'Failed to fetch URLs');
      }
    } catch {
      setError('Something went wrong while fetching URLs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (response.ok) {
        setShortUrl(data.shortUrl);
        setUrl(''); // Clear input
        await fetchUrls(); // Refresh URL list
      } else {
        setError(data.error || 'Failed to shorten URL');
      }
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to shorten"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Shorten URL
          </button>
        </form>
        {shortUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-600">Short URL:</p>
            <a
              href={shortUrl}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortUrl}
            </a>
          </div>
        )}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>

      {/* List of Saved URLs */}
      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-center">Saved URLs</h2>
        {urls.length === 0 ? (
          <p className="text-center text-gray-500">No URLs saved yet.</p>
        ) : (
          <ul className="space-y-4">
            {urls.map((entry) => (
              <li key={entry.shortId} className="bg-white p-4 rounded-lg shadow-md">
                <p>
                  <span className="font-semibold">Original URL:</span>{' '}
                  <a
                    href={entry.originalUrl}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.originalUrl}
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Short URL:</span>{' '}
                  <a
                    href={entry.shortUrl}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.shortUrl}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}