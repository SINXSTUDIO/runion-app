
import 'dotenv/config';
import { loginRateLimit } from './src/lib/rate-limit';

async function checkLimit() {
    const email = 'szkami75@gmail.com';
    try {
        const { success, limit, remaining, reset } = await loginRateLimit.limit(email);
        console.log('Rate Limit Check:', { success, limit, remaining, reset });
    } catch (error) {
        console.error('Rate Limit Error:', error);
    }
}

checkLimit();
