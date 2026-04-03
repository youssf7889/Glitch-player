"use client";

import { FolderOpen, FolderPlus } from 'lucide-react';
import { Playlist } from '@/lib/db';
import { cn } from '@/lib/utils';
import React from 'react';

interface SidebarProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  setActivePlaylistId: (id: string | null) => void;
  handleFolderUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar = React.memo(({ 
  playlists, 
  activePlaylistId, 
  setActivePlaylistId, 
  handleFolderUpload 
}: SidebarProps) => {
  return (
    <aside className="w-56 border-r-4 border-accent bg-secondary/10 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline text-sm text-muted-foreground uppercase tracking-widest">Library</span>
          <div className="flex gap-2">
            <label title="Upload Folders" className="p-1 hover:text-primary transition-colors cursor-pointer">
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
        
        <nav className="space-y-2">
          {playlists.map(playlist => (
            <div key={playlist.id} className="relative group">
              <button 
                onClick={() => setActivePlaylistId(playlist.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-1 text-left font-headline text-sm transition-all pixel-border-sm min-w-0 pr-3",
                  activePlaylistId === playlist.id ? "bg-primary text-white" : "bg-background hover:bg-secondary/50"
                )}
              >
                <FolderOpen size={16} className="shrink-0" />
                <span className="truncate flex-1 uppercase whitespace-nowrap overflow-hidden">
                  {playlist.name}
                </span>
              </button>
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
