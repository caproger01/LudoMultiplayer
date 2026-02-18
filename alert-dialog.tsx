import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  onRoll,
  disabled = false,
  size = 'md',
}) => {
  const [displayValue, setDisplayValue] = useState(1);
  const [rollAnimation, setRollAnimation] = useState(false);
  
  useEffect(() => {
    if (isRolling) {
      setRollAnimation(true);
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setRollAnimation(false);
      if (value !== null) {
        setDisplayValue(value);
      }
    }
  }, [isRolling, value]);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };
  
  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };
  
  // Render dots based on dice value
  const renderDots = () => {
    const dotPositions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };
    
    const positions = dotPositions[displayValue] || [];
    
    const positionClasses: Record<string, string> = {
      'top-left': 'top-2 left-2',
      'top-right': 'top-2 right-2',
      'middle-left': 'top-1/2 left-2 -translate-y-1/2',
      'middle-right': 'top-1/2 right-2 -translate-y-1/2',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'bottom-left': 'bottom-2 left-2',
      'bottom-right': 'bottom-2 right-2',
    };
    
    return positions.map((pos, idx) => (
      <div
        key={idx}
        className={cn(
          'absolute rounded-full bg-gray-800',
          dotSizeClasses[size],
          positionClasses[pos]
        )}
      />
    ));
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={cn(
          'relative rounded-xl bg-white',
          'border-2 border-gray-200',
          'shadow-lg transition-all duration-200',
          'flex items-center justify-center',
          sizeClasses[size],
          !disabled && !isRolling && 'hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          rollAnimation && 'animate-bounce',
          isRolling && 'animate-pulse'
        )}
        style={{
          boxShadow: rollAnimation
            ? '0 0 20px rgba(251, 191, 36, 0.6)'
            : '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        {renderDots()}
        
        {/* Shine effect */}
        <div className="absolute top-1 left-1 w-1/3 h-1/3 bg-gradient-to-br from-white/80 to-transparent rounded-tl-lg" />
      </button>
      
      {isRolling && (
        <div className="text-amber-600 font-semibold animate-pulse">
          Rolling...
        </div>
      )}
      
      {!isRolling && value !== null && (
        <div className="text-gray-600 font-medium">
          You rolled a <span className="text-amber-600 font-bold text-lg">{value}</span>
        </div>
      )}
      
      {!isRolling && value === null && !disabled && (
        <div className="text-gray-500 text-sm">
          Click to roll
        </div>
      )}
    </div>
  );
};

export default Dice;
