"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

interface JoinRoomDialogProps {
  roomId: Id<"rooms">;
  roomName: string;
}

export function JoinRoomDialog({ roomId, roomName }: JoinRoomDialogProps) {
  const { setUser } = useAuth();
  const joinRoom = useMutation(api.users.join);

  const [userName, setUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsJoining(true);
    try {
      const userId = await joinRoom({
        roomId,
        name: userName,
        isSpectator,
      });

      setUser({
        id: userId,
        name: userName,
        roomId,
      });

      // Page will automatically re-render and show the room
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-card p-6 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold">Join Room</h2>
          <p className="text-muted-foreground">{roomName}</p>
        </div>

        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="spectator"
              checked={isSpectator}
              onCheckedChange={setIsSpectator}
            />
            <Label htmlFor="spectator">Join as spectator</Label>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!userName.trim() || isJoining}
            className="w-full"
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
