'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { useParticipant } from '@/components/ParticipantProvider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  ShieldCheck,
  Users,
  User,
  LogIn,
  Loader2,
  Menu,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: typeof BookOpen;
  requiresAuth?: boolean;
  requiresApproval?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Academy', icon: BookOpen },
  { href: '/admin', label: 'Submissions', icon: ShieldCheck, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { participant, isLoading: participantLoading, isAdmin, isActualAdmin, viewAsUser, setViewAsUser } = useParticipant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoading = !authLoaded || participantLoading;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Hide navigation for unauthenticated users on public/auth pages
  const isPublicPage = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up';
  if (!isSignedIn && !isLoading && isPublicPage) {
    return null;
  }

  // Hide navigation on lesson pages (they have their own back button)
  if (pathname.startsWith('/academy/lesson/')) {
    return null;
  }

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.requiresApproval) return isAdmin || true;
    if (item.requiresAuth) return !!isSignedIn;
    return true;
  });

  return (
    <>
      {/* View as User Banner */}
      {isActualAdmin && viewAsUser && (
        <div className="sticky top-0 z-[60] bg-orange-500 text-white px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                Viewing as regular user - Admin features are hidden
              </span>
            </div>
            <button
              onClick={() => setViewAsUser(false)}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <EyeOff className="h-4 w-4" />
              Exit User View
            </button>
          </div>
        </div>
      )}
      <nav className={cn(
        "sticky z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        isActualAdmin && viewAsUser ? "top-[40px]" : "top-0"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0062FF]">
                <span className="text-lg font-bold text-white">AI</span>
              </div>
              <span className="text-base sm:text-lg font-semibold hidden sm:inline">
                Academy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#0062FF] text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      item.adminOnly && 'text-orange-500 hover:text-orange-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <div className="flex items-center">
                {isLoading ? (
                  <Button variant="ghost" size="sm" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                ) : isSignedIn ? (
                  <div className="flex items-center gap-2">
                    {isActualAdmin && (
                      <div className="hidden sm:flex items-center gap-2 mr-2">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-orange-500/10">
                          {viewAsUser ? (
                            <Eye className="h-4 w-4 text-orange-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-xs text-orange-500">View as User</span>
                          <Switch
                            checked={viewAsUser}
                            onCheckedChange={setViewAsUser}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                      </div>
                    )}
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: 'h-9 w-9',
                          userButtonPopoverCard: 'bg-card border border-border',
                          userButtonPopoverText: 'text-foreground',
                          userButtonPopoverActionButton: 'text-foreground hover:bg-accent',
                          userButtonPopoverActionButtonText: 'text-foreground',
                          userButtonPopoverFooter: 'hidden',
                        },
                      }}
                      afterSignOutUrl="/"
                    >
                      <UserButton.MenuItems>
                        <UserButton.Link
                          label="Academy Home"
                          labelIcon={<BookOpen className="h-4 w-4" />}
                          href="/"
                        />
                        <UserButton.Link
                          label="Help"
                          labelIcon={<HelpCircle className="h-4 w-4" />}
                          href="/help"
                        />
                        {isActualAdmin && !viewAsUser && (
                          <>
                            <UserButton.Link
                              label="User Management"
                              labelIcon={<Users className="h-4 w-4" />}
                              href="/admin/users"
                            />
                            <UserButton.Link
                              label="Submissions"
                              labelIcon={<ShieldCheck className="h-4 w-4" />}
                              href="/admin"
                            />
                          </>
                        )}
                      </UserButton.MenuItems>
                    </UserButton>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/sign-in">
                      <Button size="sm" className="bg-[#0062FF] hover:bg-[#0052D9]">
                        <LogIn className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Sign In</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0062FF]">
                          <span className="text-lg font-bold text-white">AI</span>
                        </div>
                        Academy
                      </div>
                      <ThemeToggle variant="outline" size="sm" />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 flex flex-col gap-1">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors active:scale-[0.98]',
                            isActive
                              ? 'bg-[#0062FF] text-white'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            item.adminOnly && !isActive && 'text-orange-500'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <Separator className="my-4" />

                  {!isSignedIn && (
                    <div className="flex flex-col gap-2">
                      <Link href="/sign-in" onClick={closeMobileMenu}>
                        <Button className="w-full justify-start bg-[#0062FF] hover:bg-[#0052D9]" size="lg">
                          <LogIn className="mr-3 h-5 w-5" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}

                  {isSignedIn && clerkUser && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-accent">
                          {clerkUser.imageUrl && (
                            <img
                              src={clerkUser.imageUrl}
                              alt={participant?.name || clerkUser.firstName || 'User'}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {participant?.name || clerkUser.fullName || 'User'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {clerkUser.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link
                          href="/help"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                        >
                          <HelpCircle className="h-5 w-5" />
                          Help
                        </Link>
                      </div>

                      {isActualAdmin && (
                        <>
                          <Separator />
                          <div className="px-3">
                            <p className="text-xs text-orange-500 mb-2">Admin</p>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2">
                                {viewAsUser ? (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">View as User</span>
                              </div>
                              <Switch
                                checked={viewAsUser}
                                onCheckedChange={setViewAsUser}
                                className="data-[state=checked]:bg-orange-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
