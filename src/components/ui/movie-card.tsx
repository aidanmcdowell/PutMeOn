
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showRating?: boolean;
  onPlayTrailer?: (movieId: number) => void;
}

const MovieCard = ({ 
  movie, 
  className, 
  showRating = true,
  onPlayTrailer,
}: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie.id);
    }
  };
  
  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-lg transition-all duration-400 bg-brand-black-light",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${movie.id}`} className="block h-full w-full">
        <div className="poster-shine aspect-[2/3] overflow-hidden relative">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt={movie.title}
              className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-gray text-muted-foreground">
              No Image
            </div>
          )}
          
          <div className={cn(
            "absolute inset-0 movie-row-overlay opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100"
          )}>
            {showRating && movie.vote_average > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 py-1 px-2 rounded-full bg-black/70 text-sm font-medium">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            
            {onPlayTrailer && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon"
                  onClick={handlePlayClick}
                  className="bg-brand-purple/80 hover:bg-brand-purple text-white rounded-full h-12 w-12"
                >
                  <Play size={20} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-2 flex flex-col">
          <h3 className="text-sm font-medium truncate group-hover:text-brand-purple-light transition-colors">{movie.title}</h3>
          {movie.release_date && (
            <p className="text-xs text-muted-foreground">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
