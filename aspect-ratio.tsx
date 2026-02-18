import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, LogIn, Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Lobby: React.FC = () => {
  const { currentRoom, setCurrentPlayerName, createRoom, joinRoom } = useGameStore();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joinError, setJoinError] = useState('');
  
  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    setCurrentPlayerName(playerName);
    createRoom(playerName);
  };
  
  const handleJoinRoom = () => {
    if (!playerName.trim() || !inviteCode.trim()) return;
    
    setJoinError('');
    setCurrentPlayerName(playerName);
    const success = joinRoom(inviteCode.toUpperCase(), playerName);
    
    if (success) {
      setShowJoinDialog(false);
      setInviteCode('');
    } else {
      setJoinError('Room not found, full, or game already started. Please check the invite code.');
    }
  };
  
  // If already in a room, show waiting room
  if (currentRoom) {
    return <WaitingRoom />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Ludo Masters
          </CardTitle>
          <CardDescription className="text-gray-500">
            Play Ludo with friends online
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12"
              maxLength={20}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleCreateRoom}
              disabled={!playerName.trim()}
              className="h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Room
            </Button>
            
            <Button
              onClick={() => {
                setShowJoinDialog(true);
                setJoinError('');
              }}
              disabled={!playerName.trim()}
              variant="outline"
              className="h-14 border-2 border-amber-200 hover:bg-amber-50 font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Join Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join a Room</DialogTitle>
            <DialogDescription>
              Enter the invite code shared by your friend
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {joinError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{joinError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Invite Code</label>
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-12 text-center text-2xl tracking-widest font-mono uppercase"
                maxLength={6}
              />
            </div>
            
            <Button
              onClick={handleJoinRoom}
              disabled={!inviteCode.trim()}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Join Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Waiting Room Component
const WaitingRoom: React.FC = () => {
  const { currentRoom, currentPlayerId, leaveRoom, setPlayerReady, startGame, addBot, removeBot, syncRoom } = useGameStore();
  const [copied, setCopied] = useState(false);
  
  // Sync room periodically
  useEffect(() => {
    const interval = setInterval(() => {
      syncRoom();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [syncRoom]);
  
  if (!currentRoom) return null;
  
  const isHost = currentRoom.hostId === currentPlayerId;
  const currentPlayer = currentRoom.players.find(p => p.id === currentPlayerId);
  const allReady = currentRoom.players.every(p => p.isReady);
  const canStart = isHost && allReady && currentRoom.players.length >= 2;
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentRoom.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Waiting Room
          </CardTitle>
          <CardDescription>
            Share the invite code with your friends
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invite Code */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Invite Code</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-3xl font-mono font-bold text-amber-700 tracking-widest">
                {currentRoom.inviteCode}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyInviteCode}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Players List */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Players ({currentRoom.players.length}/4)</div>
            <div className="space-y-2">
              {currentRoom.players.map((player) => {
                const colors = colorClasses[player.color];
                const isCurrentPlayer = player.id === currentPlayerId;
                const isBot = player.id.startsWith('bot_');
                
                return (
                  <div
                    key={player.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border-2',
                      colors.bg,
                      colors.border
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        colors.text,
                        'bg-white/60'
                      )}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={cn('font-medium', colors.text)}>
                          {player.name}
                          {isCurrentPlayer && ' (You)'}
                          {player.isHost && ' 👑'}
                          {isBot && ' 🤖'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {player.color}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {player.isReady ? (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Ready
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                          Not Ready
                        </span>
                      )}
                      
                      {isHost && isBot && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBot(player.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Empty slots */}
              {Array.from({ length: 4 - currentRoom.players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">?</span>
                    </div>
                    <div className="text-gray-400">Waiting for player...</div>
                  </div>
                  
                  {isHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addBot(`Bot ${i + 1}`)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Bot
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3 pt-2">
            {!currentPlayer?.isReady ? (
              <Button
                onClick={() => setPlayerReady(true)}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                I'm Ready
              </Button>
            ) : (
              <Button
                onClick={() => setPlayerReady(false)}
                variant="outline"
                className="w-full h-12 border-2 border-amber-200"
              >
                Not Ready
              </Button>
            )}
            
            {isHost && (
              <Button
                onClick={startGame}
                disabled={!canStart}
                className={cn(
                  'w-full h-12',
                  canStart
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                Start Game
              </Button>
            )}
            
            <Button
              onClick={leaveRoom}
              variant="ghost"
              className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Leave Room
            </Button>
          </div>
          
          {!canStart && isHost && (
            <p className="text-center text-sm text-gray-500">
              {currentRoom.players.length < 2
                ? 'Need at least 2 players to start'
                : 'Waiting for all players to be ready'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Lobby;
