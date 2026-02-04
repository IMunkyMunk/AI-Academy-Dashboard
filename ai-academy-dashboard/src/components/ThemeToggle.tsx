'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  size = 'sm',
  variant = 'ghost',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn('gap-2', className)}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span>Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span>Dark</span>}
        </>
      )}
    </Button>
  );
}
