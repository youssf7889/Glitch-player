"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, Music } from 'lucide-react';
import * as mm from 'music-metadata-browser';
import { db, TrackMetadata, Playlist } from '@/lib/db';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/player/Sidebar';
import { TrackList } from '@/components/player/TrackList';
import { PlayerFooter } from '@/components/player/PlayerFooter';

export default function GlitchPlayer() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArtUrl, setCurrentArtUrl] = useState<string | null>(null);
  
  const currentUrlRef = useRef<string | null>(null);
  const nextTrackRef = useRef<() => void>(null);

  const player = useAudioPlayer({
    onEnded: () => nextTrackRef.current?.()
  });

  const loadData = useCallback(async () => {
    const [allTracks, allPlaylists] = await Promise.all([
      db.getAllTracks(),
      db.getPlaylists()
    ]);
    setTracks(allTracks);
    setPlaylists(allPlaylists);
    
    if (!activePlaylistId && allPlaylists.length > 0) {
      setActivePlaylistId(allPlaylists[0].id);
    }
  }, [activePlaylistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentTrack = useMemo(() => 
    tracks.find(t => t.id === currentTrackId), 
  [tracks, currentTrackId]);

  useEffect(() => {
    if (currentTrack?.albumArt) {
      const url = URL.createObjectURL(currentTrack.albumArt);
      setCurrentArtUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setCurrentArtUrl(null);
  }, [currentTrack]);

  const currentPlaylist = useMemo(() => 
    playlists.find(p => p.id === activePlaylistId),
  [playlists, activePlaylistId]);

  const filteredTracks = useMemo(() => {
    if (!currentPlaylist) return [];
    
    return tracks.filter(t => {
      if (!currentPlaylist.trackIds.includes(t.id)) return false;
      const term = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(term) || t.artist.toLowerCase().includes(term);
    });
  }, [tracks, currentPlaylist, searchQuery]);

  const playTrack = useCallback(async (track: TrackMetadata) => {
    if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
    const url = URL.createObjectURL(track.blob);
    currentUrlRef.current = url;
    setCurrentTrackId(track.id);
    player.play(url);
  }, [player]);

  const nextTrack = useCallback(() => {
    if (!currentTrackId || filteredTracks.length === 0) return;
    
    if (player.repeat === 'one') {
      const track = filteredTracks.find(t => t.id === currentTrackId);
      if (track) playTrack(track);
      return;
    }

    const idx = filteredTracks.findIndex(t => t.id === currentTrackId);
    let nextIdx;

    if (player.shuffle) {
      nextIdx = Math.floor(Math.random() * filteredTracks.length);
      if (nextIdx === idx && filteredTracks.length > 1) {
        nextIdx = (nextIdx + 1) % filteredTracks.length;
      }
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= filteredTracks.length) {
        if (player.repeat === 'all') nextIdx = 0;
        else return;
      }
    }

    const track = filteredTracks[nextIdx];
    if (track) playTrack(track);
  }, [currentTrackId, filteredTracks, player.shuffle, player.repeat, playTrack]);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrackId || filteredTracks.length === 0) return;
    const idx = filteredTracks.findIndex(t => t.id === currentTrackId);
    const prevIdx = (idx - 1 + filteredTracks.length) % filteredTracks.length;
    playTrack(filteredTracks[prevIdx]);
  }, [currentTrackId, filteredTracks, playTrack]);

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    if (audioFiles.length === 0) return;

    const folderMap = new Map<string, string[]>();

    for (const file of audioFiles) {
      const fullPath = (file as any).webkitRelativePath;
      let folderName = "Uploaded Tracks";
      if (fullPath) {
        const parts = fullPath.split('/');
        folderName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      }
      
      const meta = await mm.parseBlob(file).catch(() => ({ common: {}, format: {} }));
      const track: TrackMetadata = {
        id: crypto.randomUUID(),
        name: meta.common?.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: meta.common?.artist || "Unknown Artist",
        album: meta.common?.album || "Unknown Album",
        duration: meta.format?.duration || 0,
        blob: file,
        albumArt: meta.common?.picture?.[0] ? new Blob([meta.common.picture[0].data], { type: meta.common.picture[0].format }) : null,
        addedAt: Date.now()
      };
      await db.saveTrack(track);
      if (!folderMap.has(folderName)) folderMap.set(folderName, []);
      folderMap.get(folderName)!.push(track.id);
    }

    for (const [name, trackIds] of folderMap.entries()) {
      await db.savePlaylist({ id: crypto.randomUUID(), name, trackIds, createdAt: Date.now() });
    }

    await loadData();
    e.target.value = '';
  };

  const deletePlaylist = async (id: string) => {
    if (confirm("Delete playlist?")) {
      await db.deletePlaylist(id);
      if (activePlaylistId === id) setActivePlaylistId(null);
      loadData();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') { e.preventDefault(); player.togglePlay(); }
      if (e.code === 'ArrowRight') nextTrack();
      if (e.code === 'ArrowLeft') prevTrack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, nextTrack, prevTrack]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground font-body select-none">
      <header className="h-16 flex items-center justify-between px-6 border-b-4 border-accent bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary pixel-border-sm flex items-center justify-center text-white">
            <Music size={18} strokeWidth={3} />
          </div>
          <h1 className="font-headline text-3xl tracking-tighter uppercase text-primary">グリッチプレイヤー</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-muted-foreground" size={16} />
            <Input 
              placeholder="SEARCH TRACKS..." 
              className="pl-10 h-10 w-64 pixel-border-sm bg-background font-body text-xl focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          setActivePlaylistId={setActivePlaylistId}
          deletePlaylist={deletePlaylist}
          handleFolderUpload={handleFolderUpload}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {activePlaylistId ? (
            <TrackList 
              tracks={filteredTracks}
              currentTrackId={currentTrackId}
              isPlaying={player.isPlaying}
              onPlay={playTrack}
              playlistName={currentPlaylist?.name}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
              <Music size={64} className="mb-6" />
              <h2 className="font-headline text-2xl uppercase mb-2">No Playlist Selected</h2>
              <p className="text-xl max-w-md">Import folders to start your session.</p>
            </div>
          )}
        </main>
      </div>

      <PlayerFooter 
        currentTrack={currentTrack || null}
        currentArtUrl={currentArtUrl}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        shuffle={player.shuffle}
        repeat={player.repeat}
        onTogglePlay={player.togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={player.seek}
        onChangeVolume={player.changeVolume}
        onToggleMute={player.toggleMute}
        setShuffle={player.setShuffle}
        setRepeat={player.setRepeat}
      />
    </div>
  );
}
