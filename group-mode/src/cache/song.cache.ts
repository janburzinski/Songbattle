export class Song {
  id: string;
  songlink: string;
  username: string;

  constructor(id: string, songlink: string, username: string) {
    this.id = id;
    this.songlink = songlink;
    this.username = username;
  }
}

export class SongCache {
  public songs: Map<string, Song>;

  constructor() {
    this.songs = new Map<string, Song>();
  }
}
