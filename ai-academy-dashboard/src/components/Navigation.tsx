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
  LayoutDashboard,
  Trophy,
  Grid3X3,
  Users,
  ShieldCheck,
  UserPlus,
  User,
  LogIn,
  Loader2,
  BarChart3,
  Menu,
  Target,
  Zap,
  Eye,
  EyeOff,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { CommandPalette } from '@/components/CommandPalette';
import { IntelDropNotification, useUnreadIntelCount, IntelBadge } from '@/components/IntelDropNotification';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requiresAuth?: boolean;
  requiresApproval?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mission', label: 'Mission', icon: Target, requiresAuth: true, requiresApproval: true },
  { href: '/intel', label: 'Intel', icon: Zap, requiresAuth: true, requiresApproval: true },
  { href: '/my-dashboard', label: 'My Progress', icon: User, requiresAuth: true, requiresApproval: true },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, requiresAuth: true, requiresApproval: true },
  { href: '/progress', label: 'Progress Matrix', icon: Grid3X3, requiresAuth: true, requiresApproval: true },
  { href: '/teams', label: 'Teams', icon: Users, requiresAuth: true, requiresApproval: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, requiresAuth: true, requiresApproval: true },
  { href: '/admin', label: 'Submissions', icon: ShieldCheck, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { participant, isLoading: participantLoading, isAdmin, isActualAdmin, viewAsUser, setViewAsUser, userStatus } = useParticipant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadIntelCount = useUnreadIntelCount();

  const isLoading = !authLoaded || participantLoading;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Hide navigation completely for unauthenticated users on public pages
  const isPublicPage = pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up';
  if (!isSignedIn && !isLoading && isPublicPage) {
    return null;
  }

  // Filter nav items based on user access
  const filteredNavItems = navItems.filter((item) => {
    // Admin-only items
    if (item.adminOnly) {
      return isAdmin;
    }
    // Items requiring approval
    if (item.requiresApproval) {
      return isAdmin || userStatus === 'approved';
    }
    // Items requiring auth
    if (item.requiresAuth) {
      return !!isSignedIn;
    }
    // Public items
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
              Dashboard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const showIntelBadge = item.href === '/intel' && unreadIntelCount > 0;

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
                  <span className="hidden xl:inline">{item.label}</span>
                  {showIntelBadge && <IntelBadge count={unreadIntelCount} />}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Search, Theme, Auth & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Command Palette / Search */}
            <CommandPalette />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Section - Always visible */}
            <div className="flex items-center">
              {isLoading ? (
                <Button variant="ghost" size="sm" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : isSignedIn ? (
                <div className="flex items-center gap-2">
                  {/* Admin Controls */}
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
                  {/* Clerk UserButton */}
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
                        label="My Dashboard"
                        labelIcon={<User className="h-4 w-4" />}
                        href="/my-dashboard"
                      />
                      {participant && (
                        <UserButton.Link
                          label="Public Profile"
                          labelIcon={<Settings className="h-4 w-4" />}
                          href={`/participant/${participant.nickname || participant.github_username || participant.id}`}
                        />
                      )}
                      <UserButton.Link
                        label="My Profile"
                        labelIcon={<User className="h-4 w-4" />}
                        href="/profile"
                      />
                      <UserButton.Link
                        label="Help"
                        labelIcon={<HelpCircle className="h-4 w-4" />}
                        href="/help"
                      />
                      {!participant && !isAdmin && (
                        <UserButton.Link
                          label="Complete Registration"
                          labelIcon={<UserPlus className="h-4 w-4" />}
                          href="/onboarding?from=github"
                        />
                      )}
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

            {/* Mobile Menu Button */}
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
                      Dashboard
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

                {/* Mobile Auth Section */}
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
                    {/* User Info */}
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
                        {participant && (
                          <div className="flex gap-1 mt-1">
                            <span className="text-xs bg-accent px-1.5 py-0.5 rounded">
                              {participant.role}
                            </span>
                            <span className="text-xs bg-accent px-1.5 py-0.5 rounded">
                              {participant.team}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Link
                        href="/my-dashboard"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                      >
                        <User className="h-5 w-5" />
                        My Dashboard
                      </Link>
                      {participant && (
                        <Link
                          href={`/participant/${participant.nickname || participant.github_username || participant.id}`}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                        >
                          <Settings className="h-5 w-5" />
                          Public Profile
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                      >
                        <User className="h-5 w-5" />
                        My Profile
                      </Link>
                      <Link
                        href="/help"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                      >
                        <HelpCircle className="h-5 w-5" />
                        Help
                      </Link>
                      {!participant && (
                        <Link
                          href="/onboarding?from=github"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                        >
                          <UserPlus className="h-5 w-5" />
                          Complete Registration
                        </Link>
                      )}
                    </div>

                    {/* Admin toggle for mobile */}
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

      {/* Intel Drop Notification Listener */}
      {isSignedIn && <IntelDropNotification />}
    </nav>
    </>
  );
}
