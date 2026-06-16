const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const versionFilePath = path.join(rootDir, 'src/lib/version.json');

let commitHash = 'unknown';
let commitDate = '';

try {
    commitHash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    commitDate = execSync('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M"', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch (e) {
    // Fallback if git is not available (e.g. in some CI/CD environments)
    commitHash = process.env.VERCEL_GIT_COMMIT_SHA 
        ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) 
        : 'dev-' + new Date().toISOString().substring(2, 10).replace(/-/g, '');
}

if (!commitDate) {
    const now = new Date();
    // Format: YYYY-MM-DD HH:MM
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    commitDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const versionInfo = {
    version: commitHash,
    builtAt: commitDate
};

// Ensure dir exists
const dir = path.dirname(versionFilePath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
console.log('Generated version info:', versionInfo);
