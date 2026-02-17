
import 'dotenv/config';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function resetLimit() {
    const email = 'szkami75@gmail.com';
    const key = `ratelimit:login:${email}`;

    // Also try without prefix just in case library behavior differs, 
    // but looking at source it uses prefix.
    // However, Upstash Ratelimit might use a different internal key structure.
    // It usually uses :: as separator or just :.
    // Let's list keys to be sure or just delete logical keys.
    // Actually, Ratelimit has a 'block' method but not a clear 'reset' for a specific key 
    // without knowing implementation details.
    // The implementation uses `prefix + ":" + identifier`.

    const keys = await redis.keys(`*${email}*`);
    console.log('Found keys:', keys);

    if (keys.length > 0) {
        const deleted = await redis.del(...keys);
        console.log(`Deleted ${deleted} keys.`);
    } else {
        console.log('No keys found to delete.');
    }
}

resetLimit();
