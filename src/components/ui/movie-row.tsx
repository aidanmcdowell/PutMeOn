
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/lib/types';
import MovieCard from './movie-card';
import { Button } from '@/components/ui/button';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  className?: string;
  onPlayTrailer?: (movieId: number) => void;
  viewAllLink?: string;
}

const MovieRow = ({ 
  title, 
  movies, 
  className,
  onPlayTrailer,
  viewAllLink
}: MovieRowProps) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initially
      
      // Handle resize events
      window.addEventListener('resize', handleScroll);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [movies]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  if (!movies || movies.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("relative py-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">{title}</h2>
        {viewAllLink && (
          <a 
            href={viewAllLink} 
            className="text-sm text-brand-purple hover:text-brand-purple-light transition-colors"
          >
            View all
          </a>
        )}
      </div>
      
      <div className="relative group">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <Button
            onClick={() => scroll('left')}
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </Button>
        )}
        
        {/* Right Scroll Button */}
        {showRightArrow && (
          <Button
            onClick={() => scroll('right')}
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </Button>
        )}
        
        {/* Left Gradient */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-16 movie-row-gradient-left z-[1] pointer-events-none" />
        )}
        
        {/* Right Gradient */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-16 movie-row-gradient-right z-[1] pointer-events-none" />
        )}
        
        {/* Movie Cards Container */}
        <div 
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-none gap-4 pb-2"
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              className="flex-shrink-0 w-[160px] md:w-[180px] animate-fade-in"
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
