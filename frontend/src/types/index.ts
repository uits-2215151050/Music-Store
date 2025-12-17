export interface Song {
    index: number;
    id: string; // Unique ID for keying/API (seed + index)
    title: string;
    artist: string;
    album: string;
    coverParams: string; // Encoded params for cover gen
    genre: string;
    likes: number; // Integer likes
    review: string; // Random review text
    lyrics: string; // Lyrics text
}

export interface GeneratorOptions {
    seed: string; // User provided seed
    region: string; // "en-US", "de-DE", etc.
    likesAvg: number; // 0-10
    page: number; // 1-based page index (or infinite scroll batch index)
    viewMode: 'table' | 'gallery';
}
