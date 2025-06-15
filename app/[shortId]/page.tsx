import { redirect } from 'next/navigation';
import { createClient } from 'redis';

export default async function RedirectPage({ params }: { params:  Promise <{ shortId: string }> }) {
  const { shortId } = await params;

  console.log(`Attempting to redirect for shortId: ${shortId}`); // Debug log

  let redirectUrl = '';

  try {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    await client.connect();

    const url = await client.get(`url:${shortId}`);
    console.log(`Retrieved URL for url:${shortId}: ${url}`); // Debug log

    await client.quit();

    if (!url) {
      console.log(`No URL found for shortId: ${shortId}, redirecting to /`); // Debug log
      redirectUrl = '/';
    }

    console.log(`Redirecting to: ${url}`); // Debug log
    redirectUrl  =  url || '';
  } catch (error) {
    console.error('Error redirecting URL:', error);
    redirectUrl = '/';
  } finally {                    // see this step
  redirect( redirectUrl);
}
}