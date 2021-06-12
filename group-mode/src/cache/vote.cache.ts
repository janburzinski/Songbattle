export class Vote {
  id: string;
  songlink: string;
  socketId: string;

  constructor(id: string, songlink: string, socketId: string) {
    this.id = id;
    this.songlink = songlink;
    this.socketId = socketId;
  }
}

export class VoteCache {
  public votes: Map<string, Vote>;

  constructor() {
    this.votes = new Map<string, Vote>();
  }

  public addVote(vote: Vote) {
    this.votes.set(vote.socketId, vote);
  }

  public removeVote(socketId: string) {
    this.votes.delete(socketId);
  }

  public hasVoted(socketId: string) {
    return this.votes.has(socketId);
  }
}
