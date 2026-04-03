
"use client";

import React from 'react';
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
    <footer className="h-28 bg-accent text-white border-t-4 border-primary px-6 grid grid-cols-[1fr_4fr_1fr] items-center">
      {/* Track Info Section */}
      <div className="flex items-center gap-4 justify-start min-w-0 overflow-hidden pr-4">
        <div className="w-16 h-16 bg-primary pixel-border-sm flex-shrink-0 flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]">
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

      {/* Main Controls Section */}
      <div className="flex flex-col items-center justify-center w-full px-4 gap-3">
        <div className="flex items-center justify-center gap-4">
          <ControlIcon 
            icon={Shuffle} 
            size={14}
            active={shuffle} 
            onClick={() => setShuffle(!shuffle)} 
            className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
          />
          
          <div className="flex items-center gap-2">
            <ControlIcon 
              icon={SkipBack} 
              size={18}
              onClick={onPrev} 
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
            />
            
            <button 
              onClick={onTogglePlay}
              className="w-12 h-12 bg-primary flex items-center justify-center pixel-border mx-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-none active:shadow-none"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause fill="white" size={24} strokeWidth={3} />
              ) : (
                <Play fill="white" size={24} strokeWidth={3} className="ml-0.5" />
              )}
            </button>
            
            <ControlIcon 
              icon={SkipForward} 
              size={18}
              onClick={onNext} 
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
            />
          </div>

          <div className="relative">
            <ControlIcon 
              icon={Repeat} 
              size={14}
              active={repeat !== 'none'} 
              onClick={() => {
                const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
                const nextIdx = (modes.indexOf(repeat) + 1) % modes.length;
                setRepeat(modes[nextIdx]);
              }} 
              className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
            />
            {repeat === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary px-0.5 border border-white leading-none flex items-center justify-center h-3 w-3">1</span>
            )}
          </div>
        </div>
        
        <div className="w-full max-w-4xl">
          <ProgressBar 
            current={currentTime} 
            total={duration} 
            onSeek={onSeek} 
          />
        </div>
      </div>

      {/* Volume Section */}
      <div className="flex items-center justify-end gap-3 min-w-0 pl-4">
        <div className="flex items-center gap-2 w-36">
          <ControlIcon 
            icon={isMuted ? VolumeX : Volume2} 
            size={18}
            onClick={onToggleMute} 
            className="shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
          />
          <div className="flex-1 h-4 relative flex items-center group">
            <div 
              className="absolute inset-x-0 h-0.5 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle, white 25%, transparent 25%)`,
                backgroundSize: '6px 100%',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'center'
              }}
            />
            <div 
              className="absolute left-0 h-1 bg-primary z-10"
              style={{ width: `${volume * 100}%` }}
            />
            <div 
              className="absolute w-3 h-3 bg-primary z-20 pointer-events-none pixel-border-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
              style={{ 
                left: `${volume * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer z-30"
            />
          </div>
        </div>
      </div>
    </footer>
  );
});

PlayerFooter.displayName = 'PlayerFooter';
