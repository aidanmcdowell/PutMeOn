
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getUpcomingMovies, 
  getMovieDetails,
  getSceneHighlights
} from '@/lib/api';
import Layout from '@/components/Layout';
import FeaturedMovie from '@/components/featured-movie';
import MovieRow from '@/components/ui/movie-row';
import VideoPlayer from '@/components/ui/video-player';
import SceneHighlightCard from '@/components/ui/scene-highlight-card';
import { Movie, SceneHighlight } from '@/lib/types';
import { useIsMobile } from '@/hooks/useIsMobile';

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [highlightMovie, setHighlightMovie] = useState<Movie | null>(null);
  const [highlights, setHighlights] = useState<SceneHighlight[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        
        // Fetch initial movie data
        const trending = await getTrendingMovies();
        const popular = await getPopularMovies();
        const upcoming = await getUpcomingMovies();
        
        setTrendingMovies(trending);
        setPopularMovies(popular);
        setUpcomingMovies(upcoming);
        
        // Set a random trending movie as featured
        if (trending.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, trending.length));
          const featuredMovieDetails = await getMovieDetails(trending[randomIndex].id);
          setFeaturedMovie(featuredMovieDetails);
          
          // Set another trending movie for highlights
          const highlightIndex = (randomIndex + 1) % trending.length;
          const highlightMovieDetails = await getMovieDetails(trending[highlightIndex].id);
          setHighlightMovie(highlightMovieDetails);
          
          // Get scene highlights for this movie
          const scenes = getSceneHighlights(trending[highlightIndex].id);
          setHighlights(scenes);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);
  
  const handlePlayTrailer = async (movieId: number) => {
    try {
      const movie = await getMovieDetails(movieId);
      const trailers = movie.videos?.results.filter(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      if (trailers && trailers.length > 0) {
        setCurrentVideo(trailers[0].key);
        setCurrentVideoTitle(`${movie.title} - Trailer`);
        setIsVideoOpen(true);
      } else {
        toast.error('No trailer available for this movie');
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      toast.error('Failed to load trailer');
    }
  };
  
  const handlePlayScene = (videoId: string, title: string) => {
    setCurrentVideo(videoId);
    setCurrentVideoTitle(title);
    setIsVideoOpen(true);
  };
  
  const closeVideoPlayer = () => {
    setIsVideoOpen(false);
    setCurrentVideo('');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-16 w-16 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Featured Movie */}
      {featuredMovie && (
        <FeaturedMovie 
          movie={featuredMovie} 
          onPlayTrailer={handlePlayTrailer}
        />
      )}
      
      <div className="container mx-auto px-4">
        {/* Scene Highlights Section */}
        {highlightMovie && highlights.length > 0 && (
          <div className="py-10">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Side - Movie Info */}
              <div className="md:w-1/3">
                <h2 className="text-2xl font-medium mb-4">Significant Scenes</h2>
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                    {highlightMovie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${highlightMovie.poster_path}`}
                        alt={highlightMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-gray" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{highlightMovie.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {highlightMovie.release_date && 
                        new Date(highlightMovie.release_date).getFullYear()}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {highlightMovie.overview}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Scene Highlights */}
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.slice(0, 4).map((scene) => (
                  <SceneHighlightCard 
                    key={scene.id} 
                    scene={scene}
                    onPlay={handlePlayScene}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Movie Rows */}
        <MovieRow 
          title="Trending Now" 
          movies={trendingMovies} 
          onPlayTrailer={handlePlayTrailer}
        />
        
        <MovieRow 
          title="Popular Movies" 
          movies={popularMovies} 
          onPlayTrailer={handlePlayTrailer}
        />
        
        <MovieRow 
          title="Upcoming Releases" 
          movies={upcomingMovies} 
          onPlayTrailer={handlePlayTrailer}
        />
      </div>
      
      {/* Video Player */}
      <VideoPlayer 
        videoId={currentVideo} 
        isOpen={isVideoOpen} 
        onClose={closeVideoPlayer}
        title={currentVideoTitle}
      />
    </Layout>
  );
};

export default Index;
