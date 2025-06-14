import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from 'redis';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    const shortId = nanoid(6);
    const shortUrl = `${request.nextUrl.origin}/${shortId}`;

    // Store the mapping: shortId -> original URL
    await client.set(`url:${shortId}`, url);
    // Store in a set for listing all URLs
    await client.sAdd('short_urls', JSON.stringify({ shortId, originalUrl: url, shortUrl }));

    await client.quit();

    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const shortId = request.nextUrl.pathname.split('/').pop();
  if (!shortId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    const url = await client.get(`url:${shortId}`);
    await client.quit();

    if (!url) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}