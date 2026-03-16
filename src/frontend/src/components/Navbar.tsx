import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAdminCheck } from "../hooks/useQueries";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: isAdmin } = useAdminCheck();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate({ to: "/search", search: { q: searchValue.trim() } });
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  return (
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
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search movies..."
                className="w-48 sm:w-64 h-8 bg-black/60 border-border text-sm"
                data-ocid="nav.search_input"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSearchOpen(false)}
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
            >
              <Search className="w-5 h-5" />
            </Button>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-[#e50914] hover:bg-[#c4070f] text-white"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
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
          {isLoggedIn && (
            <Link
              to="/watchlist"
              className="text-sm py-2"
              onClick={() => setMobileOpen(false)}
            >
              My List
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
  );
}
