"use client";

import React from 'react';
import { TrackMetadata } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Music } from 'lucide-react';

interface TrackListProps {
  tracks: TrackMetadata[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlay: (track: TrackMetadata) => void;
  playlistName?: string;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrackRow = React.memo(({ 
  track, 
  index, 
  isActive, 
  isPlaying, 
  onPlay 
}: { 
  track: TrackMetadata, 
  index: number, 
  isActive: boolean, 
  isPlaying: boolean,
  onPlay: (t: TrackMetadata) => void
}) => (
  <div className="relative flex items-center group">
    {/* Active Track Indicator (Moved to left) */}
    {isActive && (
      <div className={cn(
        "absolute left-0 z-10 flex items-center text-primary filter drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]",
        isPlaying && "animate-pulse"
      )}>
        <div className="w-1.5 h-3 bg-primary" />
        <div className="w-2 h-2 border-r-2 border-t-2 border-primary rotate-[45deg] -ml-[3px]" />
      </div>
    )}

    <div 
      onClick={() => onPlay(track)}
      className={cn(
        "grid grid-cols-12 gap-4 px-6 py-1 pixel-border-sm cursor-pointer items-center transition-all w-full ml-6",
        isActive 
          ? "bg-primary/10 border-primary shadow-[6px_6px_0px_0px_hsl(var(--primary))] translate-x-1" 
          : "bg-card hover:bg-secondary/20"
      )}
    >
      <div className="col-span-1 font-body text-xl text-muted-foreground flex items-center gap-2">
        <span className="w-8 text-center">{(index + 1).toString().padStart(2, '0')}</span>
      </div>
      <div className="col-span-7 flex items-center gap-3 min-w-0">
        <div className={cn(
          "font-headline text-lg font-bold truncate uppercase tracking-tight",
          isActive ? "text-primary" : ""
        )}>
          {track.name}
        </div>
      </div>
      <div className="col-span-3 font-body text-lg truncate opacity-70 text-right">
        {track.artist}
      </div>
      <div className="col-span-1 font-body text-lg opacity-60 text-right pr-2 tabular-nums">
        {formatTime(track.duration)}
      </div>
    </div>
  </div>
));

TrackRow.displayName = 'TrackRow';

export const TrackList = React.memo(({ 
  tracks, 
  currentTrackId, 
  isPlaying, 
  onPlay, 
  playlistName 
}: TrackListProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header Section (Sticky behavior) */}
      <div className="bg-background flex-shrink-0 px-6 pt-6 pb-2 z-20">
        <div className="mb-4">
          <h2 className="font-headline text-2xl mb-1 uppercase truncate max-w-xl tracking-[0.2em] text-accent">
            {playlistName || 'CHOOSE A PLAYLIST'}
          </h2>
          <p className="text-xl font-body uppercase tracking-[0.2em] opacity-70">
            {tracks.length} SONGS FOUND
          </p>
        </div>

        {/* Soft Line Above Column Headers */}
        <div className="border-t-2 border-muted mb-1 ml-6" />

        {/* Column Labels */}
        <div className="grid grid-cols-12 gap-4 px-6 py-1 text-lg font-headline text-muted-foreground border-b-2 border-muted uppercase tracking-widest ml-6">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Title</div>
          <div className="col-span-3 text-right">Artist</div>
          <div className="col-span-1 text-right pr-2">Time</div>
        </div>
      </div>

      {/* Scrollable Cards Area */}
      <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-8 custom-scrollbar">
        {tracks.map((track, i) => (
          <TrackRow 
            key={track.id} 
            track={track} 
            index={i} 
            isActive={currentTrackId === track.id} 
            isPlaying={isPlaying}
            onPlay={onPlay}
          />
        ))}
        {tracks.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <Music size={48} className="mx-auto mb-4" />
            <p className="font-headline uppercase">Empty Tracklist</p>
          </div>
        )}
      </div>
    </div>
  );
});

TrackList.displayName = 'TrackList';
