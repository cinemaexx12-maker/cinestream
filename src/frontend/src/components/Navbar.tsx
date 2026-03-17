import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  Crown,
  Edit,
  Loader2,
  LogOut,
  Menu,
  Music,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminCheck,
  useSubscription,
  useUserProfile,
  useUserProfileMutation,
} from "../hooks/useQueries";
import { useTMDBSearch } from "../hooks/useTMDB";
import { getReleaseYear, tmdbImage } from "../services/tmdb";

function isSubActive(sub: { expiryDate: bigint } | null | undefined): boolean {
  if (!sub) return false;
  return Number(sub.expiryDate) > Math.floor(Date.now() / 1000);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: isAdmin } = useAdminCheck();
  const { data: searchResults, isFetching: isSearching } =
    useTMDBSearch(searchValue);
  const { data: sub } = useSubscription();
  const { data: profile } = useUserProfile();
  const saveProfileMutation = useUserProfileMutation();

  const showDropdown = searchOpen && searchValue.length >= 2;
  const activeSub = isSubActive(sub);
  const displayName = profile?.displayName || "User";
  const avatarUrl = profile?.avatarUrl || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const openProfileEdit = () => {
    setEditName(profile?.displayName || "");
    setEditAvatar(profile?.avatarUrl || "");
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfileMutation.mutateAsync({
        displayName: editName.trim() || "User",
        avatarUrl: editAvatar.trim(),
      });
      toast.success("Profile updated");
      setProfileOpen(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchValue("");
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate({ to: "/search", search: { q: searchValue.trim() } });
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleResultClick = (movieId: number) => {
    navigate({ to: "/tmdb/$id", params: { id: String(movieId) } });
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav-solid" : "nav-blur"}`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" data-ocid="nav.logo_link" className="flex-shrink-0">
            <span className="font-display font-black text-2xl tracking-tight">
              <span className="text-[#e50914]">CINE</span>
              <span className="text-foreground">STREAM</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              to="/search"
              search={{ q: "" }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/music"
              data-ocid="nav.music_link"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Music className="w-4 h-4" /> Music
            </Link>
            {isLoggedIn && (
              <Link
                to="/watchlist"
                data-ocid="nav.watchlist_link"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-4 h-4" /> My List
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search with live dropdown */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <Input
                    autoFocus
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search movies..."
                    className="w-48 sm:w-64 h-8 bg-black/60 border-border text-sm"
                    data-ocid="nav.search_input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchOpen(true)}
                  data-ocid="nav.search_input"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}

              {/* Live search dropdown */}
              {showDropdown && (
                <div
                  data-ocid="nav.popover"
                  className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
                >
                  {isSearching ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-10 h-14 rounded skeleton-shimmer flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 skeleton-shimmer rounded" />
                            <div className="h-3 w-1/2 skeleton-shimmer rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No results found for &ldquo;{searchValue}&rdquo;
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      {searchResults.slice(0, 6).map((movie, i) => (
                        <button
                          key={movie.id}
                          type="button"
                          data-ocid={`nav.item.${i + 1}`}
                          onClick={() => handleResultClick(movie.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left group"
                        >
                          <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-secondary">
                            {movie.poster_path ? (
                              <img
                                src={tmdbImage(movie.poster_path, "w92")}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition-colors">
                              {movie.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {movie.release_date && (
                                <span className="text-xs text-muted-foreground">
                                  {getReleaseYear(movie.release_date)}
                                </span>
                              )}
                              {movie.vote_average > 0 && (
                                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                  <Star className="w-3 h-3 fill-[#e50914] text-[#e50914]" />
                                  {movie.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 6 && (
                        <button
                          type="button"
                          onClick={
                            handleSearch as unknown as React.MouseEventHandler
                          }
                          className="w-full py-3 text-center text-sm text-[#e50914] hover:bg-white/5 transition-colors border-t border-white/10"
                        >
                          View all {searchResults.length} results
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav.profile_dropdown_menu"
                    className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Avatar className="h-9 w-9 border-2 border-[#e50914]/60 hover:border-[#e50914] transition-colors">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-[#e50914] text-white text-xs font-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border w-64"
                  data-ocid="nav.profile_dropdown_menu"
                >
                  {/* User identity header */}
                  <div className="px-3 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-[#e50914] text-white text-sm font-black">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {displayName}
                        </p>
                        {activeSub && sub ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Crown className="w-3 h-3 text-yellow-400" />
                            <span
                              className="text-xs capitalize font-medium"
                              style={{ color: "#FFD700" }}
                            >
                              {sub.plan} Plan
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Free Plan
                          </span>
                        )}
                      </div>
                    </div>
                    {activeSub && sub && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Expires:{" "}
                        {new Date(
                          Number(sub.expiryDate) * 1000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <DropdownMenuItem
                    onClick={openProfileEdit}
                    data-ocid="nav.edit_profile_button"
                    className="cursor-pointer mt-1"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/subscription"
                      data-ocid="nav.manage_subscription_button"
                      className="cursor-pointer"
                    >
                      <Crown className="w-4 h-4 mr-2 text-yellow-400" />
                      {activeSub ? "Manage Subscription" : "Upgrade to Premium"}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/watchlist" className="cursor-pointer">
                      <Bookmark className="w-4 h-4 mr-2" /> My Watchlist
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="border-border" />

                  <DropdownMenuItem
                    onClick={() => clear()}
                    className="text-[#e50914] focus:text-[#e50914] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => login()}
                data-ocid="nav.login_button"
                className="bg-[#e50914] hover:bg-[#c4070f] text-white text-sm h-9 px-4 font-semibold"
                disabled={loginStatus === "logging-in"}
              >
                {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-black/95 border-t border-border px-4 py-4 flex flex-col gap-3">
            <Link
              to="/"
              className="text-sm py-2"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/search"
              search={{ q: "" }}
              className="text-sm py-2"
              onClick={() => setMobileOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/music"
              data-ocid="nav.music_link"
              className="text-sm py-2 flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Music className="w-4 h-4" style={{ color: "#1DB954" }} /> Music
            </Link>
            {isLoggedIn && (
              <Link
                to="/watchlist"
                className="text-sm py-2"
                onClick={() => setMobileOpen(false)}
              >
                My List
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to="/subscription"
                className="text-sm py-2 flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Crown className="w-4 h-4 text-yellow-400" /> Subscription
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className="text-sm py-2 flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}
            <form
              onSubmit={(e) => {
                handleSearch(e);
                setMobileOpen(false);
              }}
              className="flex gap-2 mt-2"
            >
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search movies..."
                className="flex-1 bg-secondary border-border text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-[#e50914] hover:bg-[#c4070f]"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </header>

      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          data-ocid="profile.edit.dialog"
          className="bg-card border-border max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-foreground">Display Name</Label>
              <Input
                data-ocid="profile.display_name.input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Avatar URL</Label>
              <Input
                data-ocid="profile.avatar_url.input"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://... (image URL)"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setProfileOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="profile.save_button"
              onClick={handleSaveProfile}
              disabled={saveProfileMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
