import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface SwipeableNotificationProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const DELETE_THRESHOLD = 140;

export function SwipeableNotification({ children, onDelete, className }: SwipeableNotificationProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!isHorizontal.current) return;

    // Only allow swiping left (negative)
    const clampedX = Math.min(0, dx);
    setOffsetX(clampedX);
    setIsSwiping(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) {
      setOffsetX(0);
      return;
    }

    if (Math.abs(offsetX) >= DELETE_THRESHOLD) {
      setIsRemoving(true);
      setTimeout(() => onDelete(), 300);
    } else {
      setOffsetX(0);
    }
    setIsSwiping(false);
  }, [offsetX, isSwiping, onDelete]);

  const progress = Math.min(Math.abs(offsetX) / DELETE_THRESHOLD, 1);

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', isRemoving && 'animate-out fade-out-0 slide-out-to-left duration-300', className)}
      style={isRemoving ? { maxHeight: 0, marginBottom: 0, transition: 'max-height 300ms, margin 300ms' } : undefined}
    >
      {/* Delete background revealed on swipe */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-4 rounded-lg bg-destructive transition-opacity"
        style={{ width: `${Math.max(Math.abs(offsetX), 48)}px`, opacity: progress }}
      >
        <Trash2 className={cn('w-5 h-5 text-destructive-foreground transition-transform', progress >= 1 && 'scale-125')} />
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 300ms ease-out',
        }}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
}
