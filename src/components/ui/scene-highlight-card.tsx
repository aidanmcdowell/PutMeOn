
import { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneHighlight } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface SceneHighlightCardProps {
  scene: SceneHighlight;
  onPlay?: (videoId: string, title: string) => void;
  className?: string;
}

const SceneHighlightCard = ({ 
  scene, 
  onPlay,
  className 
}: SceneHighlightCardProps) => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  
  const typeColors = {
    action: 'bg-scene-action',
    emotional: 'bg-scene-emotional',
    plot: 'bg-scene-plot',
    visuals: 'bg-scene-visuals'
  };
  
  const handlePlay = () => {
    if (scene.videoId && onPlay) {
      onPlay(scene.videoId, scene.title);
    }
  };
  
  return (
    <div 
      className={cn(
        "group relative rounded-lg overflow-hidden bg-brand-black-light border border-white/5 transition-all duration-300 hover:border-white/10",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div 
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              typeColors[scene.type]
            )}
          >
            {scene.type.charAt(0).toUpperCase() + scene.type.slice(1)}
          </div>
          
          {scene.timestamp && (
            <div className="text-xs text-muted-foreground">
              {scene.timestamp}
            </div>
          )}
        </div>
        
        <h3 className="text-base font-medium mb-2">{scene.title}</h3>
        
        {scene.isSpoiler && !showSpoiler ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <AlertTriangle className="text-yellow-500" size={20} />
            <p className="text-sm text-muted-foreground">This contains spoilers</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSpoiler(true)}
              className="mt-2"
            >
              Show anyway
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground flex-1">
            {scene.description}
          </p>
        )}
        
        {scene.videoId && (
          <div className="mt-4">
            <Button 
              onClick={handlePlay}
              className="w-full bg-brand-purple hover:bg-brand-purple-light"
            >
              <Play size={16} className="mr-2" />
              Watch Scene
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneHighlightCard;
