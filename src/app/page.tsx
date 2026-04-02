
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Upload, 
  Trash2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Music,
  FolderOpen,
  FolderPlus,
  Search,
  MoreHorizontal
} from 'lucide-react';
import * as mm from 'music-metadata-browser';
import { db, TrackMetadata, Playlist } from '@/lib/db';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { ProgressBar } from '@/components/player/ProgressBar';
import { ControlIcon } from '@/components/player/ControlIcon';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function GlitchPlayer() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all');
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArtUrl, setCurrentArtUrl] = useState<string | null>(null);
  
  const currentUrlRef = useRef<string | null>(null);
  const nextTrackRef = useRef<() => void>(null);

  const player = useAudioPlayer({
    onEnded: () => {
      if (nextTrackRef.current) {
        nextTrackRef.current();
      }
    }
  });

  const loadData = useCallback(async () => {
    const allTracks = await db.getAllTracks();
    const allPlaylists = await db.getPlaylists();
    setTracks(allTracks);
    setPlaylists(allPlaylists);
  }, []);

  const currentTrack = useMemo(() => 
    tracks.find(t => t.id === currentTrackId), 
  [tracks, currentTrackId]);

  // Manage Album Art Object URL for the footer
  useEffect(() => {
    if (currentTrack?.albumArt) {
      const url = URL.createObjectURL(currentTrack.albumArt);
      setCurrentArtUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentArtUrl(null);
    }
  }, [currentTrack]);

  const playTrack = useCallback(async (track: TrackMetadata) => {
    if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);

    const url = URL.createObjectURL(track.blob);
    currentUrlRef.current = url;
    
    setCurrentTrackId(track.id);
    player.play(url);
  }, [player]);

  const currentTracks = tracks.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    if (activePlaylistId === 'all') return matchesSearch;
    const playlist = playlists.find(p => p.id === activePlaylistId);
    return playlist?.trackIds.includes(t.id) && matchesSearch;
  });

  const nextTrack = useCallback(() => {
    if (!currentTrackId || currentTracks.length === 0) return;
    
    if (player.repeat === 'one') {
      const track = currentTracks.find(t => t.id === currentTrackId);
      if (track) playTrack(track);
      return;
    }

    const idx = currentTracks.findIndex(t => t.id === currentTrackId);
    let nextIdx;

    if (player.shuffle) {
      nextIdx = Math.floor(Math.random() * currentTracks.length);
      if (nextIdx === idx && currentTracks.length > 1) {
        nextIdx = (nextIdx + 1) % currentTracks.length;
      }
    } else {
      nextIdx = idx + 1;
      if (nextIdx >= currentTracks.length) {
        if (player.repeat === 'all') {
          nextIdx = 0;
        } else {
          return;
        }
      }
    }

    const track = currentTracks[nextIdx];
    if (track) playTrack(track);
  }, [currentTrackId, currentTracks, player.shuffle, player.repeat, playTrack]);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrackId || currentTracks.length === 0) return;
    const idx = currentTracks.findIndex(t => t.id === currentTrackId);
    const prevIdx = (idx - 1 + currentTracks.length) % currentTracks.length;
    playTrack(currentTracks[prevIdx]);
  }, [currentTrackId, currentTracks, playTrack]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const extractMetadata = async (file: File): Promise<Partial<TrackMetadata>> => {
    try {
      const metadata = await mm.parseBlob(file);
      const { common, format } = metadata;
      
      let albumArt: Blob | null = null;
      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        albumArt = new Blob([pic.data], { type: pic.format });
      }

      return {
        name: common.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: common.artist || "Unknown Artist",
        album: common.album || "Unknown Album",
        duration: format.duration || 0,
        albumArt
      };
    } catch (e) {
      console.error("Metadata extraction failed", e);
      return {
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: 0,
        albumArt: null
      };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;
      
      const meta = await extractMetadata(file);
      const track: TrackMetadata = {
        id: crypto.randomUUID(),
        name: meta.name!,
        artist: meta.artist!,
        album: meta.album!,
        duration: meta.duration!,
        blob: file,
        albumArt: meta.albumArt,
        addedAt: Date.now()
      };
      await db.saveTrack(track);
    }
    loadData();
    e.target.value = '';
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileList = Array.from(files);
    const audioFiles = fileList.filter(f => f.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) return;

    const firstPath = (audioFiles[0] as any).webkitRelativePath;
    const folderName = firstPath ? firstPath.split('/')[0] : "New Folder Playlist";

    const newTrackIds: string[] = [];

    for (const file of audioFiles) {
      const meta = await extractMetadata(file);
      const track: TrackMetadata = {
        id: crypto.randomUUID(),
        name: meta.name!,
        artist: meta.artist!,
        album: meta.album!,
        duration: meta.duration!,
        blob: file,
        albumArt: meta.albumArt,
        addedAt: Date.now()
      };
      await db.saveTrack(track);
      newTrackIds.push(track.id);
    }

    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name: folderName,
      trackIds: newTrackIds,
      createdAt: Date.now()
    };

    await db.savePlaylist(newPlaylist);
    await loadData();
    setActivePlaylistId(newPlaylist.id);
    
    e.target.value = '';
  };

  const deletePlaylist = async (id: string) => {
    if (confirm("Delete this playlist?")) {
      await db.deletePlaylist(id);
      if (activePlaylistId === id) setActivePlaylistId('all');
      loadData();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        player.togglePlay();
      }
      if (e.code === 'ArrowRight') nextTrack();
      if (e.code === 'ArrowLeft') prevTrack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, nextTrack, prevTrack]);

  const formatTime = (seconds: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground font-body select-none">
      <header className="h-16 flex items-center justify-between px-6 border-b-4 border-accent bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary pixel-border-sm flex items-center justify-center text-white">
            <Music size={18} strokeWidth={3} />
          </div>
          <h1 className="font-headline text-lg tracking-tighter uppercase text-primary">グリッチプレイヤー</h1>
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
          <label className="cursor-pointer h-10 px-4 flex items-center gap-2 bg-primary text-white pixel-border-sm hover:translate-y-0.5 transition-all">
            <Upload size={16} />
            <span className="text-lg font-headline">UPLOAD</span>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="audio/*" />
          </label>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r-4 border-accent bg-secondary/10 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-headline text-sm text-muted-foreground uppercase tracking-widest">Library</span>
              <div className="flex gap-2">
                <label title="Upload Folder as Playlist" className="p-1 hover:text-primary transition-colors cursor-pointer">
                  <FolderPlus size={20} strokeWidth={3} />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFolderUpload}
                    {...{ webkitdirectory: "", directory: "" } as any}
                    multiple 
                  />
                </label>
              </div>
            </div>
            
            <nav className="space-y-4">
              <button 
                onClick={() => setActivePlaylistId('all')}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-5 text-left font-headline text-base transition-all pixel-border-sm",
                  activePlaylistId === 'all' ? "bg-primary text-white" : "bg-background hover:bg-secondary/50"
                )}
              >
                <Music size={20} />
                ALL TRACKS
              </button>

              {playlists.map(playlist => (
                <div key={playlist.id} className="relative group">
                  <button 
                    onClick={() => setActivePlaylistId(playlist.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-5 text-left font-headline text-base transition-all pixel-border-sm",
                      activePlaylistId === playlist.id ? "bg-primary text-white" : "bg-background hover:bg-secondary/50"
                    )}
                  >
                    <FolderOpen size={20} />
                    {playlist.name.toUpperCase()}
                  </button>
                  <button 
                    onClick={() => deletePlaylist(playlist.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-destructive hover:scale-110 transition-all p-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-headline text-2xl mb-1">
                {activePlaylistId === 'all' ? 'ALL TRACKS' : playlists.find(p => p.id === activePlaylistId)?.name.toUpperCase()}
              </h2>
              <p className="text-xl font-body text-muted-foreground">
                {currentTracks.length} SONGS FOUND
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-lg font-headline text-muted-foreground border-b-2 border-muted uppercase">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-2">Album</div>
              <div className="col-span-1 text-right">Dur</div>
            </div>

            {currentTracks.map((track, i) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-1.5 pixel-border-sm cursor-pointer items-center transition-all",
                  currentTrackId === track.id 
                    ? "bg-primary/10 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))] translate-x-1" 
                    : "bg-white hover:bg-secondary/20"
                )}
              >
                <div className="col-span-1 font-body text-xl text-muted-foreground flex items-center gap-2">
                  <span className="w-8 text-center">{(i + 1).toString().padStart(2, '0')}</span>
                  {currentTrackId === track.id && player.isPlaying && (
                    <div className="flex gap-0.5 items-end h-5 mb-0.5">
                      <div className="w-1 bg-primary animate-bounce [animation-duration:0.5s]" />
                      <div className="w-1 bg-primary animate-bounce [animation-duration:0.8s]" />
                      <div className="w-1 bg-primary animate-bounce [animation-duration:0.6s]" />
                    </div>
                  )}
                </div>
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-secondary pixel-border-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {track.albumArt ? (
                      <ArtworkImage blob={track.albumArt} />
                    ) : (
                      <Music size={16} className="text-primary" />
                    )}
                  </div>
                  <div className={cn(
                    "font-headline text-base truncate uppercase tracking-tight",
                    currentTrackId === track.id ? "text-primary font-bold" : ""
                  )}>
                    {track.name}
                  </div>
                </div>
                <div className="col-span-3 font-body text-lg truncate">
                  {track.artist}
                </div>
                <div className="col-span-2 font-body text-lg truncate text-muted-foreground">
                  {track.album}
                </div>
                <div className="col-span-1 font-body text-lg text-right">
                  {formatTime(track.duration)}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="h-24 bg-accent text-white border-t-4 border-primary px-6 grid grid-cols-[1fr_2fr_1fr] items-center">
        {/* Left Column: Track Info */}
        <div className="flex items-center gap-4 justify-start min-w-0 overflow-hidden pr-4">
          <div className="w-16 h-16 bg-primary pixel-border-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
            {currentArtUrl ? (
              <img src={currentArtUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music size={24} />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-headline text-sm truncate mb-0.5 uppercase tracking-tight text-primary">
              {currentTrack?.name || 'IDLE'}
            </div>
            <div className="font-body text-2xl text-white/80 truncate uppercase">
              {currentTrack?.artist || 'SYSTEM'}
            </div>
          </div>
        </div>

        {/* Center Column: Stacked Controls & Progress Bar */}
        <div className="flex flex-col items-center justify-center w-full px-4 gap-2">
          {/* Top row: Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <ControlIcon 
              icon={Shuffle} 
              size={18}
              active={player.shuffle} 
              onClick={() => player.setShuffle(!player.shuffle)} 
            />
            <ControlIcon 
              icon={SkipBack} 
              size={20}
              onClick={prevTrack} 
            />
            <button 
              onClick={player.togglePlay}
              className="w-10 h-10 bg-primary flex items-center justify-center pixel-border-sm hover:translate-y-0.5 transition-all mx-2"
            >
              {player.isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} />}
            </button>
            <ControlIcon 
              icon={SkipForward} 
              size={20}
              onClick={nextTrack} 
            />
            <div className="relative">
              <ControlIcon 
                icon={Repeat} 
                size={18}
                active={player.repeat !== 'none'} 
                onClick={() => {
                  const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
                  const nextIdx = (modes.indexOf(player.repeat) + 1) % modes.length;
                  player.setRepeat(modes[nextIdx]);
                }} 
              />
              {player.repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary px-0.5 border border-white leading-none flex items-center justify-center h-3 w-3">1</span>
              )}
            </div>
          </div>
          {/* Bottom row: Progress Bar */}
          <div className="w-full">
            <ProgressBar 
              current={player.currentTime} 
              total={player.duration} 
              onSeek={player.seek} 
            />
          </div>
        </div>

        {/* Right Column: Volume and Menu icons */}
        <div className="flex items-center justify-end gap-6 min-w-0 pl-4">
          <div className="flex items-center gap-3 w-48">
            <ControlIcon 
              icon={player.isMuted ? VolumeX : Volume2} 
              size={20}
              onClick={player.toggleMute} 
            />
            <div className="flex-1 h-2 bg-white/10 pixel-border-sm relative cursor-pointer group">
              <div 
                className="absolute top-0 left-0 h-full bg-primary"
                style={{ width: `${player.volume * 100}%` }}
              />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={player.volume}
                onChange={(e) => player.changeVolume(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <ControlIcon icon={MoreHorizontal} size={20} />
        </div>
      </footer>
    </div>
  );
}

// Helper component to manage URL life cycle for list items
function ArtworkImage({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  if (!url) return <Music size={16} className="text-primary" />;
  return <img src={url} alt="" className="w-full h-full object-cover" />;
}
