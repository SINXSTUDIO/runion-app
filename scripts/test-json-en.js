const fs = require('fs');
try {
    const rawData = fs.readFileSync('messages/en.json');
    JSON.parse(rawData);
    console.log("JSON is valid");
} catch (e) {
    console.error("JSON Error:", e.message);
}
