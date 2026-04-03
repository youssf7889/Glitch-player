
"use client";

import { FolderOpen, FolderPlus, Trash2, ChevronUp, ChevronDown, Settings, GripVertical } from 'lucide-react';
import { Playlist } from '@/lib/db';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface SidebarProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  setActivePlaylistId: (id: string | null) => void;
  handleFolderUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePlaylist: (id: string) => void;
  onReorderPlaylist: (id: string, direction: 'up' | 'down') => void;
}

export const Sidebar = React.memo(({ 
  playlists, 
  activePlaylistId, 
  setActivePlaylistId, 
  handleFolderUpload,
  onDeletePlaylist,
  onReorderPlaylist
}: SidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <aside className="w-56 border-r-4 border-accent bg-secondary/10 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline text-sm text-muted-foreground uppercase tracking-widest">Library</span>
          <div className="flex gap-2">
            <label title="Upload Folders" className="p-1 hover:text-primary transition-colors cursor-pointer">
              <FolderPlus size={18} strokeWidth={3} />
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFolderUpload}
                {...{ webkitdirectory: "", directory: "" } as any}
                multiple 
              />
            </label>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "p-1 hover:text-primary transition-colors",
                isEditing && "text-primary bg-primary/10 pixel-border-sm translate-y-0.5"
              )}
              title="Manage Library"
            >
              <Settings size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
        
        <nav className="space-y-1.5">
          {playlists.map((playlist, idx) => (
            <div key={playlist.id} className="relative group flex items-center gap-1">
              {/* The "Line to the side" / Grip Column visible only in Edit Mode */}
              {isEditing && (
                <div className="flex flex-col items-center justify-center bg-accent/10 py-1 px-0.5 border-l-2 border-primary">
                  <button 
                    onClick={() => onReorderPlaylist(playlist.id, 'up')}
                    className="text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={idx === 0}
                  >
                    <ChevronUp size={14} strokeWidth={3} />
                  </button>
                  <div className="text-primary/40 -my-1">
                    <GripVertical size={12} />
                  </div>
                  <button 
                    onClick={() => onReorderPlaylist(playlist.id, 'down')}
                    className="text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={idx === playlists.length - 1}
                  >
                    <ChevronDown size={14} strokeWidth={3} />
                  </button>
                </div>
              )}

              <button 
                onClick={() => !isEditing && setActivePlaylistId(playlist.id)}
                className={cn(
                  "flex-1 flex items-center gap-3 px-3 py-1.5 text-left font-headline text-sm transition-all pixel-border-sm min-w-0",
                  activePlaylistId === playlist.id ? "bg-primary text-white" : "bg-background hover:bg-secondary/50",
                  isEditing && "cursor-default opacity-80"
                )}
              >
                <FolderOpen size={16} className="shrink-0" />
                <span className="truncate flex-1 uppercase">
                  {playlist.name}
                </span>
              </button>
              
              {isEditing && (
                <button 
                  onClick={() => onDeletePlaylist(playlist.id)}
                  className="p-1 text-destructive hover:bg-destructive/10 pixel-border-sm bg-background ml-1"
                  title="Remove Playlist"
                >
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          ))}

          {playlists.length === 0 && (
            <div className="p-6 text-center border-2 border-dashed border-muted">
              <p className="text-xl text-muted-foreground uppercase">Pick folders</p>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
