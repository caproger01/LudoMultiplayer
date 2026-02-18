import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import LudoBoard, { GamePiece } from './LudoBoard';
import Dice from './Dice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, ArrowLeft, Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_CLASSES } from '@/types/game';

const Game: React.FC = () => {
  const {
    gameState,
    currentPlayerId,
    currentRoom,
    rollDice,
    movePiece,
    canRoll,
    canMovePiece,
    getValidMoves,
    leaveRoom,
    syncGameState,
  } = useGameStore();
  
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  
  // Sync game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      syncGameState();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [syncGameState]);
  
  useEffect(() => {
    if (gameState?.winner) {
      setShowWinnerDialog(true);
    }
  }, [gameState?.winner]);
  
  if (!gameState || !currentRoom) return null;
  
  const currentPlayer = gameState.players.find(p => p.color === gameState.currentTurn);
  const isMyTurn = currentPlayer?.id === currentPlayerId;
  const myPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const validMoves = getValidMoves();
  
  const handlePieceClick = (pieceId: number) => {
    if (!isMyTurn || gameState.isRolling || !gameState.diceValue) return;
    if (!canMovePiece(pieceId)) return;
    
    movePiece(pieceId);
    setSelectedPiece(null);
  };
  
  const handleRoll = () => {
    if (!canRoll()) return;
    rollDice();
  };
  
  // Get position display text
  const getPositionText = (position: number, isHome: boolean, isFinished: boolean) => {
    if (isHome) return 'Home';
    if (isFinished) return 'Finished';
    if (position >= 100) return `Home+${position - 99}`;
    return `Pos ${position}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={leaveRoom}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave
          </Button>
          
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              Room: {currentRoom.inviteCode}
            </span>
          </div>
        </div>
        
        {/* Game Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Players */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Players</h3>
            {gameState.players.map((player) => {
              const isCurrentTurn = player.color === gameState.currentTurn;
              const colorClass = COLOR_CLASSES[player.color];
              
              return (
                <Card
                  key={player.id}
                  className={cn(
                    'border-2 transition-all',
                    isCurrentTurn
                      ? `${colorClass.border} ring-2 ${colorClass.shadow}`
                      : 'border-gray-200'
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          colorClass.bg,
                          'text-white font-bold'
                        )}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-1">
                          {player.name}
                          {player.isHost && <Crown className="w-4 h-4 text-amber-500" />}
                          {player.id === currentPlayerId && (
                            <span className="text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <div className={cn('text-xs capitalize', colorClass.text)}>
                          {player.color}
                        </div>
                      </div>
                      {isCurrentTurn && (
                        <div className="animate-pulse">
                          <div className={cn('w-3 h-3 rounded-full', colorClass.bg)} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Turn Indicator */}
            <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Current Turn</div>
                  <div className={cn(
                    'text-xl font-bold',
                    COLOR_CLASSES[gameState.currentTurn].text
                  )}>
                    {currentPlayer?.name}
                  </div>
                  {isMyTurn && (
                    <div className="text-amber-600 font-medium mt-1 animate-pulse">
                      Your turn!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Center - Game Board */}
          <div className="flex flex-col items-center">
            <LudoBoard
              selectedPiece={selectedPiece}
              onCellClick={() => {}}
            />
          </div>
          
          {/* Right Panel - Controls */}
          <div className="space-y-4">
            {/* Dice */}
            <Card>
              <CardContent className="p-6">
                <Dice
                  value={gameState.diceValue}
                  isRolling={gameState.isRolling}
                  onRoll={handleRoll}
                  disabled={!isMyTurn || !canRoll()}
                  size="lg"
                />
              </CardContent>
            </Card>
            
            {/* My Pieces */}
            {myPlayer && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Your Pieces</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {gameState.pieces[myPlayer.color].map((piece) => (
                      <button
                        key={piece.id}
                        onClick={() => handlePieceClick(piece.id)}
                        disabled={!canMovePiece(piece.id) || gameState.isRolling}
                        className={cn(
                          'relative p-2 rounded-lg border-2 transition-all',
                          canMovePiece(piece.id) && !gameState.isRolling
                            ? 'border-amber-400 bg-amber-50 hover:bg-amber-100 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        )}
                      >
                        <GamePiece
                          piece={piece}
                          size="md"
                          isSelected={selectedPiece === piece.id}
                        />
                        <div className="text-xs text-center mt-1 text-gray-500">
                          {getPositionText(piece.position, piece.isHome, piece.isFinished)}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {gameState.diceValue && validMoves.length === 0 && isMyTurn && (
                    <div className="text-center text-amber-600 mt-3 text-sm">
                      No valid moves. Turn will pass...
                    </div>
                  )}
                  
                  {gameState.diceValue && validMoves.length > 0 && isMyTurn && (
                    <div className="text-center text-green-600 mt-3 text-sm">
                      Click a piece to move!
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Game Info */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-700 mb-2">How to Play</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Roll 6 to move a piece from home</li>
                  <li>• Roll again after getting 6</li>
                  <li>• Land on opponent to send them home</li>
                  <li>• Safe spots (★) protect your pieces</li>
                  <li>• Get all 4 pieces home to win!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Winner Dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                  <span className={cn(
                    'text-3xl font-bold',
                    gameState.winner && COLOR_CLASSES[gameState.winner].text
                  )}>
                    {gameState.players.find(p => p.color === gameState.winner)?.name}
                  </span>
                  <div className="text-gray-500 text-lg mt-1">wins the game!</div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center gap-3 pt-4">
            <Button
              onClick={() => {
                setShowWinnerDialog(false);
                leaveRoom();
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
