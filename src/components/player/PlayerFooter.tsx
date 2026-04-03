"use client";

import React, { useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Music 
} from 'lucide-react';
import { ControlIcon } from './ControlIcon';
import { ProgressBar } from './ProgressBar';
import { TrackMetadata } from '@/lib/db';

interface PlayerFooterProps {
  currentTrack: TrackMetadata | null;
  currentArtUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (val: number) => void;
  onChangeVolume: (val: number) => void;
  onToggleMute: () => void;
  setShuffle: (val: boolean) => void;
  setRepeat: (val: 'none' | 'one' | 'all') => void;
}

export const PlayerFooter = React.memo(({
  currentTrack,
  currentArtUrl,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffle,
  repeat,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onChangeVolume,
  onToggleMute,
  setShuffle,
  setRepeat
}: PlayerFooterProps) => {
  return (
    <footer className="h-24 bg-accent text-white border-t-4 border-primary px-6 grid grid-cols-[1fr_2fr_1fr] items-center">
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

      <div className="flex flex-col items-center justify-center w-full px-4 gap-2">
        <div className="flex items-center justify-center gap-4">
          <ControlIcon 
            icon={Shuffle} 
            size={18}
            active={shuffle} 
            onClick={() => setShuffle(!shuffle)} 
          />
          <ControlIcon 
            icon={SkipBack} 
            size={20}
            onClick={onPrev} 
          />
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 bg-primary flex items-center justify-center pixel-border-sm hover:translate-y-0.5 transition-all mx-2"
          >
            {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} />}
          </button>
          <ControlIcon 
            icon={SkipForward} 
            size={20}
            onClick={onNext} 
          />
          <div className="relative">
            <ControlIcon 
              icon={Repeat} 
              size={18}
              active={repeat !== 'none'} 
              onClick={() => {
                const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
                const nextIdx = (modes.indexOf(repeat) + 1) % modes.length;
                setRepeat(modes[nextIdx]);
              }} 
            />
            {repeat === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary px-0.5 border border-white leading-none flex items-center justify-center h-3 w-3">1</span>
            )}
          </div>
        </div>
        <div className="w-full">
          <ProgressBar 
            current={currentTime} 
            total={duration} 
            onSeek={onSeek} 
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 min-w-0 pl-4">
        <div className="flex items-center gap-3 w-64">
          <ControlIcon 
            icon={isMuted ? VolumeX : Volume2} 
            size={20}
            onClick={onToggleMute} 
          />
          <div className="flex-1 h-3 bg-white/10 pixel-border-sm relative cursor-pointer group">
            <div 
              className="absolute top-0 left-0 h-full bg-primary"
              style={{ width: `${volume * 100}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </footer>
  );
});

PlayerFooter.displayName = 'PlayerFooter';
