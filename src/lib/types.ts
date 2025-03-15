
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: Genre[];
  videos?: {
    results: Video[];
  };
  credits?: {
    cast: Cast[];
    crew: Crew[];
  };
  similar?: {
    results: Movie[];
  };
  keywords?: {
    keywords: Keyword[];
  };
  "watch/providers"?: {
    results: {
      [country: string]: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      };
    };
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface Keyword {
  id: number;
  name: string;
}

export interface SceneHighlight {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'emotional' | 'plot' | 'visuals';
  timestamp?: string;
  videoId?: string;
  isSpoiler?: boolean;
}

export type DiscoveryMode = 'put-me-on' | 'pull-me-in';

export interface DiscoveryQuestion {
  id: string;
  text: string;
  mode: DiscoveryMode;
  order: number;
}

export interface DiscoveryAnswer {
  questionId: string;
  answer: string;
}

export interface MovieRecommendation {
  movie: Movie;
  reason: string;
}
