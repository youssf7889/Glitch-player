# グリッチプレイヤー (Glitch Player)

A retro-styled 8-bit web music player built with Next.js, Genkit, and ShadCN.

It's a music player, it looks nice, I think. You can add a folder as a playlist. it's very basic but i like it like this if u have any notes or feedback or whatever u can text me.

<img width="1257" height="748" alt="image" src="https://github.com/user-attachments/assets/94ec6c36-7bfd-4c7c-9180-7a490d22ce2d" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/819f75f5-3cbf-43d7-9b6f-dfc5d6736366" />

## Pushing to GitHub

To push this project to your repository at `https://github.com/youssf7889/Glitch-player-02`, run the following commands in your terminal:

```bash
# 1. Initialize the local directory as a Git repository
git init

# 2. Add the files in your new local repository
git add .

# 3. Commit the files that you've staged in your local repository
git commit -m "Initial commit"

# 4. Add the URL for the remote repository where your local repository will be pushed
git remote add origin https://github.com/youssf7889/Glitch-player-02.git

# 5. Rename the current branch to 'main'
git branch -M main

# 6. Push the changes in your local repository to GitHub
git push -u origin main
```

*Note: You may be prompted to log in to GitHub or provide a Personal Access Token (PAT) if you haven't set up SSH keys.*

## Features

- **Retro 8-bit Aesthetic**: Pixel borders, sharp shadows, and arcade-inspired typography.
- **Local Storage**: Tracks and playlists are stored locally in your browser using IndexedDB.
- **Audio Controls**: Shuffle, Repeat, Volume, and Seek functionality.
- **Folder Upload**: Easily import your music collection by selecting a folder.

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.