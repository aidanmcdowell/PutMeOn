
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
    // If we already have scenes, enhance them with AI analysis
    if (existingScenes && existingScenes.length > 0) {
      console.log('Generating AI scene highlights for:', movieTitle);
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
              content: `You are an expert film critic who identifies the most captivating scenes in movies. Your goal is to highlight scenes that would make viewers interested in watching the movie without revealing major plot twists. For each scene, provide:
              1. Why it's captivating (visuals, emotional impact, action, character development)
              2. A rating from 1-10 on how likely this scene would make someone want to watch the movie
              3. A brief, engaging description that entices viewers`
            },
            {
              role: 'user',
              content: `For the movie "${movieTitle}": ${overview}\n\nRank these scenes from most interesting (1) to least interesting and explain why each would make viewers want to watch the film:\n${existingScenes.map(scene => `- ${scene.title}: ${scene.description} (Type: ${scene.type})`).join('\n')}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1200,
        })
      });

      const result = await response.json();
      console.log('AI response:', result);
      const aiAnalysis = result.choices[0]?.message?.content || '';
      console.log('AI analysis:', aiAnalysis);
      
      // Process AI response to sort scenes
      const enhancedScenes = enhanceSceneDescriptions(existingScenes, aiAnalysis);
      
      // Sort the scenes based on the AI scores (higher scores = more interesting)
      enhancedScenes.sort((a, b) => getSceneScore(b, aiAnalysis) - getSceneScore(a, aiAnalysis));
      
      // Take the top 4 most interesting scenes
      return enhancedScenes.slice(0, Math.min(4, enhancedScenes.length));
    }
    
    // If no existing scenes, return them unmodified
    return existingScenes;
  } catch (error) {
    console.error('Error analyzing movie scenes:', error);
    return existingScenes;
  }
}

// Enhance scene descriptions based on AI analysis
function enhanceSceneDescriptions(scenes: SceneHighlight[], aiAnalysis: string): SceneHighlight[] {
  // Try to extract better descriptions from the AI analysis
  return scenes.map(scene => {
    // Look for a section about this scene in the AI analysis
    const sceneRegex = new RegExp(`(?:.*${scene.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\n)(.*?)(?:\\n|$)`, 'is');
    const descriptionMatch = aiAnalysis.match(sceneRegex);
    
    // If we found a better description, use it
    if (descriptionMatch && descriptionMatch[1] && descriptionMatch[1].length > 30) {
      // Clean up the description
      let enhancedDescription = descriptionMatch[1].trim();
      // Remove any number ratings like (8/10) or "Rating: 9/10"
      enhancedDescription = enhancedDescription.replace(/\(?\bRating:?\s*\d+\/10\)?/i, '');
      enhancedDescription = enhancedDescription.replace(/\(?\b\d+\/10\)?/i, '');
      
      return {
        ...scene,
        description: enhancedDescription
      };
    }
    
    return scene;
  });
}

// Calculate scene score based on AI analysis
function getSceneScore(scene: SceneHighlight, aiAnalysis: string): number {
  // Look for explicit rankings or scores
  const ratingRegex = new RegExp(`${scene.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\b(\\d+)[\\s/]*10\\b`, 'i');
  const rankRegex = new RegExp(`#(\\d+)[:\\s].*?${scene.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  
  const ratingMatch = aiAnalysis.match(ratingRegex);
  const rankMatch = aiAnalysis.match(rankRegex);
  
  if (ratingMatch && ratingMatch[1]) {
    // If we found an explicit rating like "8/10", use that
    return parseInt(ratingMatch[1]);
  }
  
  if (rankMatch && rankMatch[1]) {
    // If we found an explicit ranking like "#1", convert to a score (10 for #1, 9 for #2, etc.)
    const rank = parseInt(rankMatch[1]);
    return Math.max(10 - rank + 1, 1); // Ensure minimum score of 1
  }
  
  // Calculate score based on positive keywords in the AI analysis
  const sceneContext = findSceneContext(scene, aiAnalysis);
  if (!sceneContext) return 5; // Default score
  
  // Positive keywords that indicate a scene is interesting
  const positiveKeywords = {
    strong: ['captivating', 'breathtaking', 'spectacular', 'masterful', 'iconic', 'unforgettable', 'riveting'],
    medium: ['emotional', 'powerful', 'intense', 'compelling', 'striking', 'stunning', 'exciting', 'impressive'],
    mild: ['interesting', 'engaging', 'memorable', 'pivotal', 'crucial', 'important', 'dramatic']
  };
  
  let score = 5; // default score
  
  // Check for strong positive keywords (worth 1.5 points each)
  positiveKeywords.strong.forEach(keyword => {
    if (sceneContext.toLowerCase().includes(keyword)) {
      score += 1.5;
    }
  });
  
  // Check for medium positive keywords (worth 1 point each)
  positiveKeywords.medium.forEach(keyword => {
    if (sceneContext.toLowerCase().includes(keyword)) {
      score += 1;
    }
  });
  
  // Check for mild positive keywords (worth 0.5 points each)
  positiveKeywords.mild.forEach(keyword => {
    if (sceneContext.toLowerCase().includes(keyword)) {
      score += 0.5;
    }
  });
  
  // Cap the score at 10
  return Math.min(score, 10);
}

// Helper function to find the context of a scene in the AI analysis
function findSceneContext(scene: SceneHighlight, aiAnalysis: string): string {
  // Look for a paragraph that contains the scene title
  const paragraphs = aiAnalysis.split('\n\n');
  const relevantParagraph = paragraphs.find(p => 
    p.toLowerCase().includes(scene.title.toLowerCase()) || 
    p.toLowerCase().includes(scene.description.substring(0, 30).toLowerCase())
  );
  
  return relevantParagraph || '';
}
