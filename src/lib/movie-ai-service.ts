
import { SceneHighlight } from './types';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Analyze a movie and generate AI-enhanced scene highlights
 */
export async function generateAISceneHighlights(
  movieTitle: string,
  overview: string,
  existingScenes: SceneHighlight[]
): Promise<SceneHighlight[]> {
  try {
    // If we already have scenes, enhance them with AI ratings
    if (existingScenes && existingScenes.length > 0) {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemma-3-4b-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a film expert who identifies the most memorable and interesting scenes in movies. Rank the provided scenes by how likely they are to make viewers interested in watching the movie.'
            },
            {
              role: 'user',
              content: `For the movie "${movieTitle}": ${overview}\n\nRank these scenes from most interesting (1) to least interesting and explain briefly why:\n${existingScenes.map(scene => `- ${scene.title}: ${scene.description}`).join('\n')}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        })
      });

      const result = await response.json();
      const aiAnalysis = result.choices[0]?.message?.content || '';
      
      // Process AI response to find ranking
      const rankedScenes = [...existingScenes];
      
      // Sort the scenes based on the AI analysis (higher scores = more interesting)
      rankedScenes.sort((a, b) => {
        const aScore = getSceneScore(a, aiAnalysis);
        const bScore = getScoreScore(b, aiAnalysis);
        return bScore - aScore;
      });
      
      // Take the top 3-4 most interesting scenes
      return rankedScenes.slice(0, Math.min(4, rankedScenes.length));
    }
    
    // If no existing scenes, generate new ones
    return existingScenes;
  } catch (error) {
    console.error('Error analyzing movie scenes:', error);
    return existingScenes;
  }
}

// Helper function to estimate a score for a scene based on AI analysis
function getSceneScore(scene: SceneHighlight, aiAnalysis: string): number {
  const titleMatches = aiAnalysis.match(new RegExp(`${scene.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?(\\d+)`, 'i'));
  const descriptionMatches = aiAnalysis.match(new RegExp(`${scene.description.substring(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?(\\d+)`, 'i'));
  
  // Check for explicit rankings (like "1.", "2.", etc.)
  if (titleMatches && titleMatches[1]) {
    // Lower number is better, so invert the score
    return 10 - parseInt(titleMatches[1]);
  }
  
  if (descriptionMatches && descriptionMatches[1]) {
    return 10 - parseInt(descriptionMatches[1]);
  }
  
  // Calculate score based on positive keywords in the AI analysis
  const positiveKeywords = ['captivating', 'emotional', 'powerful', 'memorable', 'iconic', 'intense', 'dramatic', 'striking', 'pivotal', 'crucial'];
  let score = 5; // default score
  
  const sceneContext = aiAnalysis.split(/\n/).find(line => 
    line.includes(scene.title) || line.includes(scene.description.substring(0, 30))
  ) || '';
  
  positiveKeywords.forEach(keyword => {
    if (sceneContext.toLowerCase().includes(keyword)) {
      score += 1;
    }
  });
  
  return score;
}

// Fix typo in function name
function getScoreScore(scene: SceneHighlight, aiAnalysis: string): number {
  return getSceneScore(scene, aiAnalysis);
}
