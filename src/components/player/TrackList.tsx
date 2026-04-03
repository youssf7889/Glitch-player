"use client";

import React from 'react';
import { TrackMetadata } from '@/lib/db';
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: TrackMetadata[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlay: (track: TrackMetadata) => void;
  playlistName?: string;
}

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
  <div className="relative flex items-center">
    <div 
      onClick={() => onPlay(track)}
      className={cn(
        "grid grid-cols-12 gap-4 px-6 py-0.5 pixel-border-sm cursor-pointer items-center transition-all w-full",
        isActive 
          ? "bg-primary/10 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))] translate-x-1" 
          : "bg-card hover:bg-secondary/20"
      )}
    >
      <div className="col-span-1 font-body text-xl text-muted-foreground flex items-center gap-2">
        <span className="w-8 text-center">{(index + 1).toString().padStart(2, '0')}</span>
      </div>
      <div className="col-span-8 flex items-center gap-3 min-w-0">
        <div className={cn(
          "font-headline text-lg font-bold truncate uppercase tracking-tight",
          isActive ? "text-primary" : ""
        )}>
          {track.name}
        </div>
      </div>
      <div className="col-span-3 font-body text-lg truncate opacity-70 text-right pr-4">
        {track.artist}
      </div>
    </div>
    
    {isActive && (
      <div className={cn(
        "absolute -right-4 flex items-center text-primary filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]",
        isPlaying && "animate-pulse"
      )}>
        <div className="w-2 h-2 border-l-2 border-t-2 border-primary rotate-[135deg]" />
        <div className="w-1.5 h-3 bg-primary -ml-[2px]" />
      </div>
    )}
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
    <div className="space-y-4">
      <div className="mb-4 flex items-end justify-between">
        <div className="opacity-70">
          <h2 className="font-headline text-2xl mb-1 uppercase truncate max-w-xl tracking-[0.2em]">
            {playlistName || 'CHOOSE A PLAYLIST'}
          </h2>
          <p className="text-xl font-body uppercase tracking-[0.1em]">
            {tracks.length} SONGS FOUND
          </p>
        </div>
      </div>

      <div className="space-y-1.5 pb-8">
        <div className="grid grid-cols-12 gap-4 px-6 py-1 text-lg font-headline text-muted-foreground border-b-2 border-muted uppercase tracking-widest">
          <div className="col-span-1">#</div>
          <div className="col-span-8">Title</div>
          <div className="col-span-3 text-right pr-4">Artist</div>
        </div>

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
      </div>
    </div>
  );
});

TrackList.displayName = 'TrackList';
