'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { useParticipant } from '@/components/ParticipantProvider';
import { BookOpen, HelpCircle } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Academy', icon: BookOpen },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading: participantLoading } = useParticipant();
  const isLoading = !isLoaded || participantLoading;

  // Hide on public/auth pages and lesson pages
  const isPublicPage = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up';
  if (!isSignedIn && !isLoading && isPublicPage) return null;
  if (pathname.startsWith('/academy/lesson/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors active:scale-95',
                isActive ? 'text-[#0062FF]' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-[#0062FF] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
