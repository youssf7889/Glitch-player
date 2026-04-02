
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'glitch-player-db';
const STORE_TRACKS = 'tracks';
const STORE_PLAYLISTS = 'playlists';

export interface TrackMetadata {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  blob: Blob;
  addedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export const db = {
  async saveTrack(track: TrackMetadata) {
    const db = await getDB();
    await db.put(STORE_TRACKS, track);
  },
  async getTrack(id: string): Promise<TrackMetadata | undefined> {
    const db = await getDB();
    return db.get(STORE_TRACKS, id);
  },
  async getAllTracks(): Promise<TrackMetadata[]> {
    const db = await getDB();
    return db.getAll(STORE_TRACKS);
  },
  async deleteTrack(id: string) {
    const db = await getDB();
    await db.delete(STORE_TRACKS, id);
  },
  async savePlaylist(playlist: Playlist) {
    const db = await getDB();
    await db.put(STORE_PLAYLISTS, playlist);
  },
  async getPlaylists(): Promise<Playlist[]> {
    const db = await getDB();
    return db.getAll(STORE_PLAYLISTS);
  },
  async deletePlaylist(id: string) {
    const db = await getDB();
    await db.delete(STORE_PLAYLISTS, id);
  }
};
