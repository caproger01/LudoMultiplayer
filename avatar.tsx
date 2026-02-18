import React from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Piece, PlayerColor } from '@/types/game';
import { COLOR_CLASSES, SAFE_POSITIONS } from '@/types/game';
import { cn } from '@/lib/utils';

interface LudoBoardProps {
  onCellClick?: (position: number) => void;
  selectedPiece?: number | null;
}

const LudoBoard: React.FC<LudoBoardProps> = ({ onCellClick, selectedPiece }) => {
  const { gameState } = useGameStore();
  
  if (!gameState) return null;
  
  // Get pieces at a specific position
  const getPiecesAtPosition = (position: number): Piece[] => {
    const pieces: Piece[] = [];
    Object.values(gameState.pieces).forEach(playerPieces => {
      playerPieces.forEach(piece => {
        if (!piece.isHome && !piece.isFinished && piece.position === position) {
          pieces.push(piece);
        }
      });
    });
    return pieces;
  };
  
  // Get home pieces for a color
  const getHomePieces = (color: PlayerColor): Piece[] => {
    return gameState.pieces[color]?.filter(p => p.isHome) || [];
  };
  
  // Get home stretch pieces for a color
  const getHomeStretchPieces = (color: PlayerColor): Piece[] => {
    return gameState.pieces[color]?.filter(p => !p.isHome && !p.isFinished && p.position >= 100) || [];
  };
  
  // Check if position is safe
  const isSafePosition = (position: number) => SAFE_POSITIONS.includes(position);
  
  // Render a track cell
  const renderCell = (position: number, extraClass?: string) => {
    const pieces = getPiecesAtPosition(position);
    const isSafe = isSafePosition(position);
    
    return (
      <div
        key={position}
        className={cn(
          'relative w-full h-full flex items-center justify-center',
          'border border-gray-300/60 bg-white/80',
          isSafe && 'bg-amber-100',
          extraClass
        )}
        onClick={() => onCellClick?.(position)}
      >
        {isSafe && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
        )}
        {pieces.length > 0 && (
          <div className="flex flex-wrap gap-0.5 items-center justify-center">
            {pieces.map((piece) => (
              <GamePiece
                key={`${piece.color}-${piece.id}`}
                piece={piece}
                isSelected={selectedPiece === piece.id}
                size={pieces.length > 1 ? 'xs' : 'sm'}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render home area
  const renderHomeArea = (color: PlayerColor, position: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left') => {
    const pieces = getHomePieces(color);
    const colorClass = COLOR_CLASSES[color];
    
    const positionClasses = {
      'top-left': 'top-0 left-0',
      'top-right': 'top-0 right-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
    };
    
    return (
      <div
        className={cn(
          'absolute w-[40%] h-[40%]',
          colorClass.bg,
          'shadow-inner border-4 border-white/60 rounded-xl',
          positionClasses[position]
        )}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => {
              const piece = pieces.find(p => p.id === i);
              return (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 border-white/70',
                    'flex items-center justify-center',
                    'bg-white/30 backdrop-blur-sm'
                  )}
                >
                  {piece && (
                    <GamePiece
                      piece={piece}
                      isSelected={selectedPiece === piece.id}
                      size="sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Render home stretch cell
  const renderHomeStretchCell = (color: PlayerColor, index: number) => {
    const pieces = getHomeStretchPieces(color);
    const piece = pieces.find(p => p.position === 100 + index);
    const colorClass = COLOR_CLASSES[color];
    
    return (
      <div
        key={`${color}-${index}`}
        className={cn(
          'w-full h-full flex items-center justify-center',
          colorClass.bg,
          'border border-white/50'
        )}
      >
        {piece && (
          <GamePiece
            piece={piece}
            isSelected={selectedPiece === piece.id}
            size="sm"
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="relative w-full max-w-[520px] aspect-square mx-auto">
      {/* Board background */}
      <div className="absolute inset-0 bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-200" />
      
      {/* Home areas - 4 corners */}
      {gameState.pieces['red'] && renderHomeArea('red', 'top-left')}
      {gameState.pieces['blue'] && renderHomeArea('blue', 'top-right')}
      {gameState.pieces['green'] && renderHomeArea('green', 'bottom-right')}
      {gameState.pieces['yellow'] && renderHomeArea('yellow', 'bottom-left')}
      
      {/* Center cross track area */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%]">
        {/* Center star */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-3xl text-amber-500">★</div>
        </div>
      </div>
      
      {/* Main track - Cross shape */}
      <div className="absolute inset-[40%]">
        {/* Top vertical section (3 wide x 6 tall) - Red home stretch + path */}
        <div className="absolute bottom-full left-0 w-full h-[200%] flex">
          {/* Red home stretch (5 cells) */}
          <div className="w-1/3 h-full flex flex-col">
            {[4, 3, 2, 1, 0].map(i => (
              <div key={`red-stretch-${i}`} className="flex-1">
                {renderHomeStretchCell('red', i)}
              </div>
            ))}
          </div>
          {/* Center path */}
          <div className="w-1/3 h-full flex flex-col">
            {renderCell(0, 'bg-red-200')}
            {renderCell(1)}
            {renderCell(2)}
            {renderCell(3)}
            {renderCell(4)}
            {renderCell(5)}
          </div>
          {/* Right side */}
          <div className="w-1/3 h-full flex flex-col">
            {renderCell(46)}
            {renderCell(47)}
            {renderCell(48)}
            {renderCell(49)}
            {renderCell(50)}
            {renderCell(51)}
          </div>
        </div>
        
        {/* Right horizontal section (6 wide x 3 tall) */}
        <div className="absolute top-0 left-full w-[200%] h-full flex flex-col">
          <div className="h-1/3 flex">
            {renderCell(7)}
            {renderCell(8)}
            {renderCell(9)}
            {renderCell(10)}
            {renderCell(11)}
            {renderCell(12)}
          </div>
          <div className="h-1/3 flex">
            {renderHomeStretchCell('blue', 4)}
            {renderHomeStretchCell('blue', 3)}
            {renderHomeStretchCell('blue', 2)}
            {renderHomeStretchCell('blue', 1)}
            {renderHomeStretchCell('blue', 0)}
            {renderCell(13, 'bg-blue-200')}
          </div>
          <div className="h-1/3 flex">
            {renderCell(14)}
            {renderCell(15)}
            {renderCell(16)}
            {renderCell(17)}
            {renderCell(18)}
            {renderCell(19)}
          </div>
        </div>
        
        {/* Bottom vertical section */}
        <div className="absolute top-full left-0 w-full h-[200%] flex">
          <div className="w-1/3 h-full flex flex-col">
            {renderCell(33)}
            {renderCell(34)}
            {renderCell(35)}
            {renderCell(36)}
            {renderCell(37)}
            {renderCell(38)}
          </div>
          <div className="w-1/3 h-full flex flex-col">
            {renderCell(32)}
            {renderCell(31)}
            {renderCell(30)}
            {renderCell(29)}
            {renderCell(28)}
            {renderCell(27, 'bg-green-200')}
          </div>
          <div className="w-1/3 h-full flex flex-col">
            {renderHomeStretchCell('green', 0)}
            {renderHomeStretchCell('green', 1)}
            {renderHomeStretchCell('green', 2)}
            {renderHomeStretchCell('green', 3)}
            {renderHomeStretchCell('green', 4)}
            <div className="flex-1" />
          </div>
        </div>
        
        {/* Left horizontal section */}
        <div className="absolute top-0 right-full w-[200%] h-full flex flex-col">
          <div className="h-1/3 flex">
            {renderCell(45)}
            {renderCell(44)}
            {renderCell(43)}
            {renderCell(42)}
            {renderCell(41)}
            {renderCell(40)}
          </div>
          <div className="h-1/3 flex">
            {renderCell(39, 'bg-yellow-200')}
            {renderHomeStretchCell('yellow', 0)}
            {renderHomeStretchCell('yellow', 1)}
            {renderHomeStretchCell('yellow', 2)}
            {renderHomeStretchCell('yellow', 3)}
            {renderHomeStretchCell('yellow', 4)}
          </div>
          <div className="h-1/3 flex">
            {renderCell(20)}
            {renderCell(21)}
            {renderCell(22)}
            {renderCell(23)}
            {renderCell(24)}
            {renderCell(25)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Piece Component
interface GamePieceProps {
  piece: Piece;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const GamePiece: React.FC<GamePieceProps> = ({
  piece,
  isSelected = false,
  size = 'md',
  onClick,
}) => {
  const colorClass = COLOR_CLASSES[piece.color];
  
  const sizeClasses = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full font-bold text-white',
        'flex items-center justify-center',
        'transition-all duration-200',
        'border-2 border-white/90',
        colorClass.bg,
        sizeClasses[size],
        isSelected && 'ring-2 ring-white scale-110 shadow-lg',
        'hover:scale-110 active:scale-95'
      )}
    >
      {piece.id + 1}
    </button>
  );
};

export default LudoBoard;
