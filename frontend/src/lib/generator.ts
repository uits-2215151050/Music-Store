import { GeneratorOptions, Song } from '@/types';
import { createRNG } from './rng';
import enUS from '@/data/en-US.json';
import deDE from '@/data/de-DE.json';
import ukUA from '@/data/uk-UA.json';

const DATA_SETS: Record<string, any> = {
    'en-US': enUS,
    'de-DE': deDE,
    'uk-UA': ukUA,
};

const ITEMS_PER_PAGE = 20; // Or whatever batch size we want

export function generateSongs(options: GeneratorOptions): Song[] {
    const { seed, region, likesAvg, page } = options;
    const data = DATA_SETS[region] || enUS;

    // Create an RNG specifically for this page to ensure paginated consistency
    // We actually need per-item consistency if we want absolute stability,
    // but the requirement says "Change seed changes data".
    // "Changing likes only updates like counts, titles... stay same".
    // This implies Titles/Artists depend on (Seed + Region + Index).
    // Likes depend on (Seed + Index + LikesParam).

    const songs: Song[] = [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        const absoluteIndex = startIndex + i + 1;

        // RNG for content (Titles, Artists) - INDEPENDENT of Likes
        // Seed component: UserSeed + Region + AbsoluteIndex
        const contentRNG = createRNG(`${seed}-${region}`, absoluteIndex);

        const title = getRandomItem(data.titles, contentRNG);
        const artist = getRandomItem(data.artists, contentRNG);
        const genre = getRandomItem(data.genres, contentRNG);

        // Album: 50% chance to be "Single", else random album name
        const isSingle = contentRNG() > 0.5;
        const album = isSingle ? "Single" : getRandomItem(data.albums, contentRNG);

        const review = getRandomItem(data.reviews, contentRNG);
        const lyrics = getRandomItem(data.lyrics, contentRNG);

        // RNG for Likes - DEPENDENT on LikesAvg (probabilistic)
        // AND Seed (so it's reproducible)
        // Requirement: "Changing likes only updates the like counts".
        // So we use a separate RNG or just the same base seed but mix in the index?
        // Actually, to make it consistent for the same likesAvg, we need reproducible RNG.
        // To make it change when likesAvg changes, we assume the logic handles the distribution using a consistent random value.

        const likesRNG = createRNG(`${seed}-likes`, absoluteIndex);
        const likes = generateLikes(options.likesAvg, likesRNG);
        songs.push({
            index: absoluteIndex,
            id: `${seed}-${region}-${absoluteIndex}`,
            title,
            artist,
            album,
            genre,
            coverParams: `${seed}-${region}-${absoluteIndex}`, // Use ID for safer URLs
            likes,
            review,
            lyrics,
        });
    }

    return songs;
}

function getRandomItem(array: string[], rng: () => number): string {
    const index = Math.floor(rng() * array.length);
    return array[index];
}

function generateLikes(avg: number, rng: () => number): number {
    // Generate a varied distribution using sum of randoms (approx Gaussian)
    // Sum of 3 uniform [0,1] gives mean 1.5, range [0,3]
    const r = rng() + rng() + rng();

    // Center at 0, range [-1.5, 1.5]
    const variation = r - 1.5;

    // Scale spread. A spread factor of 2.0 gives a meaningful range (approx +/- 3 likes)
    const spread = 2.0;

    // Calculate raw value
    let val = avg + (variation * spread);

    // Round to integer
    let likes = Math.round(val);

    // Clamp between 0 and 10
    if (likes < 0) likes = 0;
    if (likes > 10) likes = 10;

    return likes;
}
