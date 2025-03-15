
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, Menu, X, Film, Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchMovies } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/useIsMobile";

const MainNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Discover", path: "/discover", icon: Sparkles },
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.trim()) {
        const results = await searchMovies(debouncedSearchQuery);
        setSearchResults(results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => document.getElementById("search-input")?.focus(), 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleMovieClick = (movieId: number) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
    navigate(`/movie/${movieId}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <Film className="text-brand-purple" />
            <span className="text-gradient">PutMeOn</span>
          </Link>

          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "flex gap-2",
                    location.pathname === item.path 
                      ? "text-brand-purple hover:text-brand-purple-light" 
                      : "text-white/70 hover:text-white"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClick}
                aria-label="Search"
                className="text-white/70 hover:text-white"
              >
                <Search size={20} />
              </Button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 md:w-96 bg-brand-black-light rounded-lg border border-white/10 shadow-xl z-50">
                  <div className="p-3">
                    <Input
                      id="search-input"
                      placeholder="Search for movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-brand-black border-white/20"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-[70vh] overflow-y-auto">
                      {searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-center gap-3 p-3 hover:bg-brand-black cursor-pointer transition-colors"
                          onClick={() => handleMovieClick(movie.id)}
                        >
                          <div className="w-10 h-14 flex-shrink-0 bg-brand-black-light rounded overflow-hidden">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-full h-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-medium truncate">{movie.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown year"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="text-white/70 hover:text-white md:hidden"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
          </div>
        </nav>

        {isMobile && mobileMenuOpen && (
          <div className="mt-4 pb-2 space-y-1 md:hidden animate-slide-down">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  location.pathname === item.path 
                    ? "text-brand-purple hover:text-brand-purple-light" 
                    : "text-white/70 hover:text-white"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={18} />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default MainNav;
