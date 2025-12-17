import { mulberry32 } from './rng';

export function generateCoverSvg(seedStr: string, title: string, artist: string): string {
    // Hash seed
    let seedNum = 0;
    for (let i = 0; i < seedStr.length; i++) seedNum = (Math.imul(31, seedNum) + seedStr.charCodeAt(i)) | 0;
    const rng = mulberry32(seedNum);

    // Random colors
    const hue = Math.floor(rng() * 360);
    const sat = 50 + Math.floor(rng() * 50);
    const light = 40 + Math.floor(rng() * 40);
    const bgColor = `hsl(${hue}, ${sat}%, ${light}%)`;

    // Pattern (simple shapes)
    let shapes = '';
    const numShapes = 5 + Math.floor(rng() * 10);
    for (let i = 0; i < numShapes; i++) {
        const x = Math.floor(rng() * 200);
        const y = Math.floor(rng() * 200);
        const size = 10 + Math.floor(rng() * 50);
        const sHue = (hue + Math.floor(rng() * 60)) % 360;
        const opacity = 0.2 + rng() * 0.5;
        const isCircle = rng() > 0.5;

        if (isCircle) {
            shapes += `<circle cx="${x}" cy="${y}" r="${size}" fill="hsl(${sHue}, ${sat}%, ${light}%)" opacity="${opacity}" />`;
        } else {
            shapes += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="hsl(${sHue}, ${sat}%, ${light}%)" opacity="${opacity}" />`;
        }
    }

    // SVG Template
    // Note: Escaping simplified for this task, real strings might need XML escaping
    const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeArtist = artist.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${bgColor}" />
        ${shapes}
        <text x="100" y="80" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${safeTitle}</text>
        <text x="100" y="110" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">${safeArtist}</text>
    </svg>
    `.trim();
}
