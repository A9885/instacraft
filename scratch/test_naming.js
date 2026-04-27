const path = require('path');

function getFilename(originalName, hash, extension) {
    const originalNameWithoutExt = path.parse(originalName).name || 'file';
    const safeBaseName = originalNameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '');
    const shortHash = hash.substring(0, 10);
    return `${shortHash}-${safeBaseName}${extension}`;
}

const testCases = [
    { name: 'WhatsApp Image 2025-04-14 at 20.25.07.jpeg', hash: '919c1e7773xxxxxxxx', ext: '.jpeg' },
    { name: 'simple.png', hash: 'abcdef123456', ext: '.png' },
    { name: 'dots.in.name.jpg', hash: '1234567890123', ext: '.jpg' },
    { name: 'spaces removed.webp', hash: '0987654321', ext: '.webp' }
];

testCases.forEach(tc => {
    console.log(`Input: ${tc.name} -> Output: ${getFilename(tc.name, tc.hash, tc.ext)}`);
});
