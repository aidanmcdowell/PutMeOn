import { Movie, SceneHighlight } from './types';
import { generateAISceneHighlights } from './movie-ai-service';

const API_KEY = 'e160f716a47db916b59e84e44f943984';
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to handle API requests
async function fetchFromAPI(endpoint: string, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Get trending movies
export async function getTrendingMovies() {
  const data = await fetchFromAPI('/trending/movie/day');
  return data.results;
}

// Get popular movies
export async function getPopularMovies() {
  const data = await fetchFromAPI('/movie/popular');
  return data.results;
}

// Get upcoming movies
export async function getUpcomingMovies() {
  const data = await fetchFromAPI('/movie/upcoming');
  return data.results;
}

// Get movie details
export async function getMovieDetails(movieId: number) {
  const data = await fetchFromAPI(`/movie/${movieId}`, {
    append_to_response: 'videos,similar,credits,keywords,watch/providers',
  });
  return data;
}

// Search movies
export async function searchMovies(query: string) {
  if (!query) return [];
  
  const data = await fetchFromAPI('/search/movie', {
    query,
    include_adult: false,
  });
  
  return data.results;
}

// Get similar movies with enhanced logic using keywords
export async function getEnhancedSimilarMovies(movieId: number) {
  const movie = await getMovieDetails(movieId);
  
  // Extract keywords and genres
  const keywords = movie.keywords?.keywords || [];
  const genres = movie.genres || [];
  
  // Get similar movies from API
  let similarMovies = movie.similar?.results || [];
  
  // Sort by relevance (matching keywords and genres)
  similarMovies = similarMovies.map((similar: any) => {
    // This is simplified as we don't have keyword data for each similar movie in this fetch
    // In a real implementation, you would fetch keyword data for each similar movie
    const genreMatch = similar.genre_ids.filter((id: number) => 
      genres.some((genre: any) => genre.id === id)
    ).length;
    
    return {
      ...similar,
      relevance: genreMatch / genres.length,
    };
  });
  
  // Sort by relevance score
  return similarMovies.sort((a: any, b: any) => b.relevance - a.relevance);
}

// Get scene highlights with AI enhancement
export async function getAIEnhancedSceneHighlights(movieId: number, movieTitle: string, overview: string): Promise<SceneHighlight[]> {
  // First get the mock scenes
  const mockScenes = getSceneHighlights(movieId);
  
  // Then enhance them with AI analysis
  return generateAISceneHighlights(movieTitle, overview, mockScenes);
}

// Mock function to get scene highlights (in a real app, this would come from a backend API)
export function getSceneHighlights(movieId: number): SceneHighlight[] {
  // This is mock data - in a real app, you would fetch this from an API
  const mockScenes: Record<number, SceneHighlight[]> = {
    // For Interstellar
    157336: [
      {
        id: '1',
        title: 'Docking Scene',
        description: 'Cooper attempts to dock with the spinning Endurance after Mann\'s failed docking damages the airlock.',
        type: 'action',
        videoId: 'a3lcGnMhvsA',
      },
      {
        id: '2',
        title: 'Time Dilation on Miller\'s Planet',
        description: 'The crew experiences extreme time dilation near the black hole, causing minutes for them to be years on Earth.',
        type: 'visuals',
        videoId: 'MoLkabPK3YU',
      },
      {
        id: '3',
        title: 'Cooper watches messages from Earth',
        description: 'After returning from Miller\'s planet, Cooper watches 23 years worth of messages from his children.',
        type: 'emotional',
        videoId: 'MoLkabPK3YU',
      },
      {
        id: '4',
        title: 'Tesseract Revelation',
        description: 'Cooper discovers he can communicate across time through gravity, allowing him to send the quantum data back to Earth.',
        type: 'plot',
        isSpoiler: true,
        videoId: 'MoLkabPK3YU',
      },
    ],
    // Mock data for other popular movies
    // For The Godfather
    238: [
      {
        id: '1',
        title: 'The Offer',
        description: 'Vito Corleone discusses making an offer "he can\'t refuse" - one of cinema\'s most iconic lines.',
        type: 'plot',
        videoId: 'fmX2VzsB25s',
      },
      {
        id: '2',
        title: 'Horse Head Scene',
        description: 'Film producer Jack Woltz wakes up to find the severed head of his prized racehorse in his bed.',
        type: 'plot',
        isSpoiler: true,
        videoId: 'VC1_tdnZq1A',
      }
    ],
    // Default scenes for any movie without specific scenes
    0: [
      {
        id: '1',
        title: 'Climactic Confrontation',
        description: 'The protagonist faces their ultimate challenge in an emotionally charged scene.',
        type: 'emotional',
      },
      {
        id: '2',
        title: 'Key Action Sequence',
        description: 'An expertly choreographed action sequence that showcases the film\'s visual style.',
        type: 'action',
      }
    ]
  };
  
  return mockScenes[movieId] || mockScenes[0];
}
