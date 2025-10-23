import { Node } from "@xyflow/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { SanitizedVote } from "@/convex/model/rooms";

// Node data types
export type PlayerNodeData = {
  user: Doc<"users">;
  isCurrentUser: boolean;
  isCardPicked: boolean;
  card: string | null;
};

export type StoryNodeData = {
  title: string;
  description: string;
  storyId: string;
  isGameOver?: boolean;
  hasVotes?: boolean;
  onRevealCards?: () => void;
  onResetGame?: () => void;
};

export type SessionNodeData = {
  sessionName: string;
  participantCount: number;
  voteCount: number;
  isVotingComplete: boolean;
  hasVotes: boolean;
  onRevealCards?: () => void;
  onResetGame?: () => void;
};

export type TimerNodeData = {
  // Synchronized timer state fields
  startedAt: number | null; // Server timestamp when started
  pausedAt: number | null; // Server timestamp when paused
  elapsedSeconds: number; // Total elapsed seconds
  isRunning: boolean; // Current running state (derived from timestamps)
  
  // Tracking fields
  lastUpdatedBy: Id<"users"> | null; // User who last changed timer
  lastAction: "start" | "pause" | "reset" | null; // Last action performed
  
  // Required fields for timer synchronization
  roomId: Id<"rooms">; // Room ID for timer sync
  userId?: Id<"users">; // Current user ID for timer controls
  nodeId: string; // Node ID for timer sync
};

export type VotingCardNodeData = {
  card: { value: string };
  userId: string;
  roomId: string;
  isSelectable: boolean;
  isSelected: boolean;
  onCardSelect?: (cardValue: string) => void;
};

export type ResultsNodeData = {
  votes: SanitizedVote[];
  users: Doc<"users">[];
};

// Node types
export type PlayerNodeType = Node<PlayerNodeData, "player">;
export type StoryNodeType = Node<StoryNodeData, "story">;
export type SessionNodeType = Node<SessionNodeData, "session">;
export type TimerNodeType = Node<TimerNodeData, "timer">;
export type VotingCardNodeType = Node<VotingCardNodeData, "votingCard">;
export type ResultsNodeType = Node<ResultsNodeData, "results">;

// Union type for all custom nodes
export type CustomNodeType =
  | PlayerNodeType
  | StoryNodeType
  | SessionNodeType
  | TimerNodeType
  | VotingCardNodeType
  | ResultsNodeType;