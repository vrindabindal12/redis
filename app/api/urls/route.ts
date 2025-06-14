import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export async function GET() {
  try {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    const urls = await client.sMembers('short_urls');
    const parsedUrls = urls.map((url) => JSON.parse(url));

    await client.quit();

    return NextResponse.json(parsedUrls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}