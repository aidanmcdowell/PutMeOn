
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, MessageSquare, Film, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DiscoveryMode, DiscoveryQuestion, DiscoveryAnswer, MovieRecommendation } from '@/lib/types';

// Mock questions for each discovery mode
const putMeOnQuestions: DiscoveryQuestion[] = [
  {
    id: 'genre',
    text: 'What genres of movies do you enjoy the most?',
    mode: 'put-me-on',
    order: 1,
  },
  {
    id: 'mood',
    text: 'What kind of mood are you in right now?',
    mode: 'put-me-on',
    order: 2,
  },
  {
    id: 'recent',
    text: 'Name a movie you\'ve watched recently that you loved.',
    mode: 'put-me-on',
    order: 3,
  },
  {
    id: 'themes',
    text: 'What themes or topics are you interested in exploring?',
    mode: 'put-me-on',
    order: 4,
  },
  {
    id: 'actors',
    text: 'Do you have any favorite actors or directors?',
    mode: 'put-me-on',
    order: 5,
  }
];

const pullMeInQuestions: DiscoveryQuestion[] = [
  {
    id: 'scenes',
    text: 'What type of scenes captivate you the most? (action, emotional, plot twists, visuals)',
    mode: 'pull-me-in',
    order: 1,
  },
  {
    id: 'characters',
    text: 'What character qualities do you find most interesting?',
    mode: 'pull-me-in',
    order: 2,
  },
  {
    id: 'emotions',
    text: 'What emotions do you want to experience while watching?',
    mode: 'pull-me-in',
    order: 3,
  },
  {
    id: 'storytelling',
    text: 'Do you prefer straightforward or complex storytelling?',
    mode: 'pull-me-in',
    order: 4,
  },
  {
    id: 'moments',
    text: 'Describe a movie moment that had a strong impact on you.',
    mode: 'pull-me-in',
    order: 5,
  }
];

// Mock recommendation data (in a real app, this would be generated based on user answers)
const mockRecommendations: Record<DiscoveryMode, MovieRecommendation[]> = {
  'put-me-on': [
    {
      movie: {
        id: 157336,
        title: 'Interstellar',
        poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
        release_date: '2014-11-05',
        vote_average: 8.3,
      },
      reason: 'Based on your interest in science fiction and emotional storytelling, Interstellar offers both mind-bending concepts and deeply moving family relationships.',
    },
    {
      movie: {
        id: 238,
        title: 'The Godfather',
        poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdrop_path: '/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
        overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
        release_date: '1972-03-14',
        vote_average: 8.7,
      },
      reason: 'Your interest in complex characters and family dynamics makes The Godfather a perfect match - it\'s widely considered one of the greatest films ever made.',
    },
    {
      movie: {
        id: 550,
        title: 'Fight Club',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
        release_date: '1999-10-15',
        vote_average: 8.4,
      },
      reason: 'Based on your preference for psychological themes and plot twists, Fight Club delivers with its mind-bending narrative and social commentary.',
    }
  ],
  'pull-me-in': [
    {
      movie: {
        id: 13,
        title: 'Forrest Gump',
        poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        backdrop_path: '/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg',
        overview: 'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.',
        release_date: '1994-06-23',
        vote_average: 8.5,
      },
      reason: 'You mentioned emotional scenes that leave a lasting impact - Forrest Gump contains several powerful moments that have become cultural touchstones.',
    },
    {
      movie: {
        id: 24428,
        title: 'The Avengers',
        poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
        backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
        overview: 'When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster. Spanning the globe, a daring recruitment effort begins!',
        release_date: '2012-04-25',
        vote_average: 7.7,
      },
      reason: 'Your interest in visually spectacular action sequences makes The Avengers a great pick - it features some of the most memorable team-up action scenes in cinema.',
    },
    {
      movie: {
        id: 155,
        title: 'The Dark Knight',
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop_path: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
        overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
        release_date: '2008-07-16',
        vote_average: 8.5,
      },
      reason: 'The Dark Knight features unforgettable character moments and plot twists, perfectly matching your desire for captivating scenes that leave you thinking.',
    }
  ]
};

const Discover = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<DiscoveryMode | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DiscoveryAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const questions = selectedMode === 'put-me-on' 
    ? putMeOnQuestions 
    : selectedMode === 'pull-me-in' 
      ? pullMeInQuestions 
      : [];
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleModeSelect = (mode: DiscoveryMode) => {
    setSelectedMode(mode);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setShowResults(false);
  };
  
  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please enter an answer before continuing');
      return;
    }
    
    if (!currentQuestion) return;
    
    // Add answer to the list
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        answer: currentAnswer
      }
    ]);
    
    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      setShowResults(true);
    }
  };
  
  const handleSkipToResults = () => {
    setShowResults(true);
  };
  
  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };
  
  const handleRestart = () => {
    setSelectedMode(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setShowResults(false);
  };
  
  // Get the appropriate recommendations based on selected mode
  const recommendations = selectedMode ? mockRecommendations[selectedMode] : [];
  
  return (
    <Layout>
      <div className="min-h-screen pt-16 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center py-10">
            <h1 className="text-3xl md:text-5xl font-bold text-gradient mb-4">
              Discovery Mode
            </h1>
            {!selectedMode && (
              <p className="text-lg text-white/70">
                Choose how you want to discover new content
              </p>
            )}
          </div>
          
          {/* Mode Selection */}
          {!selectedMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <Button
                onClick={() => handleModeSelect('put-me-on')}
                variant="outline"
                className="h-auto py-6 flex items-center justify-center border-white/20 bg-black/30 backdrop-blur-sm hover:bg-brand-purple/20 hover:border-brand-purple transition-all"
              >
                <div className="text-xl font-medium">Put Me On</div>
              </Button>
              
              <Button
                onClick={() => handleModeSelect('pull-me-in')}
                variant="outline"
                className="h-auto py-6 flex items-center justify-center border-white/20 bg-black/30 backdrop-blur-sm hover:bg-brand-purple/20 hover:border-brand-purple transition-all"
              >
                <div className="text-xl font-medium">Pull Me In</div>
              </Button>
              
              <Card className="col-span-1 md:col-span-2 p-6 bg-black/30 backdrop-blur-sm border-white/10">
                <p className="text-white/70 text-center">
                  {selectedMode === 'put-me-on' 
                    ? 'Discover new movies based on your tastes and preferences.'
                    : 'Discover movies with scenes that will captivate and draw you in.'}
                </p>
              </Card>
            </div>
          )}
          
          {/* Mode Description */}
          {selectedMode && !showResults && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-white/60">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <Button
                  variant="link"
                  className="text-brand-purple hover:text-brand-purple-light"
                  onClick={handleSkipToResults}
                >
                  Skip to Results
                </Button>
              </div>
            </div>
          )}
          
          {/* Question Flow */}
          {selectedMode && currentQuestion && !showResults && (
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
              <div className="flex gap-3 mb-4">
                <MessageSquare className="text-brand-purple h-6 w-6 flex-shrink-0" />
                <h2 className="text-xl font-medium">{currentQuestion.text}</h2>
              </div>
              
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[120px] bg-black/50 border-white/20 focus:border-brand-purple text-white"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleSubmitAnswer}
                  className="bg-brand-purple hover:bg-brand-purple-light"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Results */}
          {showResults && (
            <div>
              <h2 className="text-2xl font-medium mb-6">Your Recommendations</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {recommendations.map((recommendation) => (
                  <div 
                    key={recommendation.movie.id}
                    className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
                    onClick={() => handleMovieClick(recommendation.movie.id)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 lg:w-1/4 aspect-[2/3] overflow-hidden bg-brand-black flex-shrink-0">
                        {recommendation.movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w342${recommendation.movie.poster_path}`}
                            alt={recommendation.movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-black-light">
                            <Film className="h-12 w-12 text-white/20" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 md:p-6 flex flex-col">
                        <div className="mb-2 flex justify-between items-start">
                          <h3 className="text-xl font-medium">{recommendation.movie.title}</h3>
                          <div className="flex items-center bg-brand-black px-2 py-1 rounded text-sm">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{recommendation.movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                          {recommendation.movie.overview}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="bg-brand-purple/20 border border-brand-purple/30 rounded-lg p-3">
                            <p className="text-brand-purple-light font-medium mb-1">Why we recommend this:</p>
                            <p className="text-white/80 text-sm">{recommendation.reason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="border-white/20 hover:bg-brand-purple hover:text-white hover:border-brand-purple"
                >
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
