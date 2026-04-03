
"use client";

import { FolderOpen, FolderPlus, Trash2, ChevronUp, ChevronDown, Settings } from 'lucide-react';
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
          <div className="flex gap-1">
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
                isEditing && "text-primary"
              )}
              title="Manage Playlists"
            >
              <Settings size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
        
        <nav className="space-y-1.5">
          {playlists.map((playlist, idx) => (
            <div key={playlist.id} className="relative group flex items-center gap-1">
              <button 
                onClick={() => !isEditing && setActivePlaylistId(playlist.id)}
                className={cn(
                  "flex-1 flex items-center gap-3 px-3 py-1 text-left font-headline text-sm transition-all pixel-border-sm min-w-0 pr-3",
                  activePlaylistId === playlist.id ? "bg-primary text-white" : "bg-background hover:bg-secondary/50",
                  isEditing && "cursor-default opacity-80"
                )}
              >
                <FolderOpen size={16} className="shrink-0" />
                <span className="truncate flex-1 uppercase whitespace-nowrap overflow-hidden">
                  {playlist.name}
                </span>
              </button>
              
              {isEditing && (
                <div className="flex flex-col gap-0.5 ml-1">
                  <button 
                    onClick={() => onReorderPlaylist(playlist.id, 'up')}
                    className="p-0.5 hover:bg-secondary/30 pixel-border-sm"
                    disabled={idx === 0}
                  >
                    <ChevronUp size={12} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => onDeletePlaylist(playlist.id)}
                    className="p-0.5 hover:bg-destructive/20 text-destructive pixel-border-sm"
                  >
                    <Trash2 size={12} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => onReorderPlaylist(playlist.id, 'down')}
                    className="p-0.5 hover:bg-secondary/30 pixel-border-sm"
                    disabled={idx === playlists.length - 1}
                  >
                    <ChevronDown size={12} strokeWidth={3} />
                  </button>
                </div>
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
