
import { useState } from 'react';
import { Play, Star, Calendar, Clock, Tag } from 'lucide-react';
import { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface FeaturedMovieProps {
  movie: Movie;
  onPlayTrailer: (movieId: number) => void;
}

const FeaturedMovie = ({ movie, onPlayTrailer }: FeaturedMovieProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const handleTrailerClick = () => {
    onPlayTrailer(movie.id);
  };

  // Format runtime to hours and minutes
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="relative w-full overflow-hidden">
      {/* Backdrop Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full">
        {movie.backdrop_path ? (
          <>
            <div 
              className={`w-full h-full bg-brand-black ${isImageLoaded ? 'animate-fade-out' : ''}`}
              style={{ display: isImageLoaded ? 'none' : 'block' }}
            />
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
              onLoad={() => setIsImageLoaded(true)}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-brand-gray" />
        )}
        <div className="absolute inset-0 backdrop-gradient" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto py-32 pt-48 px-6 flex flex-col items-start">
        <div className="max-w-2xl animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">{movie.title}</h1>
          
          {/* Movie Details */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            
            {movie.release_date && (
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
            
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-muted-foreground" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
            
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag size={16} className="text-muted-foreground" />
                <span>{movie.genres.slice(0, 3).map(g => g.name).join(', ')}</span>
              </div>
            )}
          </div>
          
          {/* Overview */}
          <p className="text-base text-muted-foreground mb-6 line-clamp-3">
            {movie.overview}
          </p>
          
          {/* Trailer Button */}
          <Button
            onClick={handleTrailerClick}
            className="bg-brand-purple hover:bg-brand-purple-light text-white"
          >
            <Play size={16} className="mr-2" />
            Watch Trailer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMovie;
