
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Star, 
  Calendar, 
  Clock, 
  Tag, 
  Play, 
  ChevronLeft, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { getMovieDetails, getEnhancedSimilarMovies, getSceneHighlights } from '@/lib/api';
import { Movie, SceneHighlight } from '@/lib/types';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/ui/movie-card';
import SceneHighlightCard from '@/components/ui/scene-highlight-card';
import VideoPlayer from '@/components/ui/video-player';
import { useIsMobile } from '@/hooks/useIsMobile';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [scenes, setScenes] = useState<SceneHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;
      
      try {
        setIsLoading(true);
        window.scrollTo(0, 0);
        
        // Fetch movie details
        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
        
        // Fetch enhanced similar movies
        const enhancedSimilar = await getEnhancedSimilarMovies(movieId);
        setSimilarMovies(enhancedSimilar.slice(0, 8));
        
        // Get scene highlights
        const highlightScenes = getSceneHighlights(movieId);
        setScenes(highlightScenes);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        toast.error('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [movieId]);
  
  const handlePlayTrailer = () => {
    if (!movie?.videos?.results) {
      toast.error('No videos available for this movie');
      return;
    }
    
    const trailers = movie.videos.results.filter(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailers.length > 0) {
      setCurrentVideo(trailers[0].key);
      setCurrentVideoTitle(`${movie.title} - Trailer`);
      setIsVideoOpen(true);
    } else {
      toast.error('No trailer available for this movie');
    }
  };
  
  const handlePlayVideo = (videoId: string, title: string) => {
    setCurrentVideo(videoId);
    setCurrentVideoTitle(title);
    setIsVideoOpen(true);
  };
  
  const closeVideoPlayer = () => {
    setIsVideoOpen(false);
    setCurrentVideo('');
  };
  
  // Format runtime to hours and minutes
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get streaming providers for US
  const getProviders = () => {
    if (!movie || !movie['watch/providers']?.results?.US) return null;
    return movie['watch/providers'].results.US;
  };
  
  const providers = getProviders();
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-16 w-16 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (!movie) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the movie you're looking for.
          </p>
          <Link to="/">
            <Button>
              <ChevronLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-gray" />
        )}
        <div className="absolute inset-0 backdrop-gradient" />
      </div>
      
      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8 animate-slide-up">
          {/* Movie Poster */}
          <div className="w-full max-w-[200px] md:max-w-[300px] mx-auto md:mx-0 poster-shine">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-brand-gray rounded-lg flex items-center justify-center text-muted-foreground">
                No Poster
              </div>
            )}
          </div>
          
          {/* Movie Details */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{movie.title}</h1>
            
            {/* Movie Metadata */}
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
            </div>
            
            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span 
                      key={genre.id}
                      className="px-3 py-1 bg-brand-black-light rounded-full text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Overview</h3>
              <p className="text-muted-foreground">{movie.overview}</p>
            </div>
            
            {/* Trailer Button */}
            <Button
              onClick={handlePlayTrailer}
              className="bg-brand-purple hover:bg-brand-purple-light text-white mb-6"
            >
              <Play size={16} className="mr-2" />
              Watch Trailer
            </Button>
            
            {/* Where to Watch */}
            {providers && (providers.flatrate || providers.rent || providers.buy) && (
              <div>
                <h3 className="text-lg font-medium mb-2">Where to Watch</h3>
                
                <div className="space-y-3">
                  {providers.flatrate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Stream</p>
                      <div className="flex flex-wrap gap-2">
                        {providers.flatrate.map((provider) => (
                          <div 
                            key={provider.provider_id}
                            className="w-12 h-12 rounded-lg overflow-hidden bg-brand-black-light"
                            title={provider.provider_name}
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {providers.rent && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rent</p>
                      <div className="flex flex-wrap gap-2">
                        {providers.rent.map((provider) => (
                          <div 
                            key={provider.provider_id}
                            className="w-12 h-12 rounded-lg overflow-hidden bg-brand-black-light"
                            title={provider.provider_name}
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs for Scenes, Similar Movies, and Cast */}
        <div className="py-8">
          <Tabs defaultValue="scenes" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="scenes">Significant Scenes</TabsTrigger>
              <TabsTrigger value="similar">Similar Movies</TabsTrigger>
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scenes" className="animate-fade-in">
              {scenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scenes.map((scene) => (
                    <SceneHighlightCard 
                      key={scene.id} 
                      scene={scene}
                      onPlay={handlePlayVideo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No significant scenes found for this movie.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="similar" className="animate-fade-in">
              {similarMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {similarMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No similar movies found.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cast" className="animate-fade-in">
              {movie.credits?.cast && movie.credits.cast.length > 0 ? (
                <div>
                  <h3 className="text-xl font-medium mb-4">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movie.credits.cast.slice(0, 12).map((person) => (
                      <div key={`${person.id}-${person.order}`} className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-brand-black-light">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-gray">
                              <span className="text-2xl font-medium text-white/30">
                                {person.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{person.name}</span>
                        <span className="text-xs text-muted-foreground">{person.character}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <h3 className="text-xl font-medium mb-4">Key Crew</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {movie.credits.crew
                      .filter((crew) => ['Director', 'Producer', 'Screenplay', 'Writer'].includes(crew.job))
                      .slice(0, 6)
                      .map((person) => (
                        <div key={`${person.id}-${person.job}`} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-black-light">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-gray">
                                <span className="text-lg font-medium text-white/30">
                                  {person.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-muted-foreground">{person.job}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No cast information available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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

export default MovieDetail;
