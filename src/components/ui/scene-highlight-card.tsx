
import { useState } from 'react';
import { Play, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneHighlight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    action: 'bg-scene-action text-white',
    emotional: 'bg-scene-emotional text-white',
    plot: 'bg-scene-plot text-white',
    visuals: 'bg-scene-visuals text-white'
  };
  
  const typeLabels = {
    action: 'Action',
    emotional: 'Emotional',
    plot: 'Plot',
    visuals: 'Visuals'
  };
  
  const handlePlay = () => {
    if (scene.videoId && onPlay) {
      onPlay(scene.videoId, scene.title);
    }
  };
  
  return (
    <div 
      className={cn(
        "group relative rounded-lg overflow-hidden bg-brand-black-light border border-white/5 transition-all duration-300 hover:border-brand-purple/30 hover:shadow-lg hover:shadow-brand-purple/5",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div 
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full flex items-center",
              typeColors[scene.type]
            )}
          >
            {typeLabels[scene.type]}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className="ml-1 opacity-70" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {scene.type === 'action' && 'Exciting action scene'}
                    {scene.type === 'emotional' && 'Emotionally impactful moment'}
                    {scene.type === 'plot' && 'Important plot development'}
                    {scene.type === 'visuals' && 'Visually stunning sequence'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        
        {scene.videoId ? (
          <div className="mt-4">
            <Button 
              onClick={handlePlay}
              className="w-full bg-brand-purple hover:bg-brand-purple-light group"
            >
              <Play size={16} className="mr-2 transition-transform group-hover:scale-110" />
              Watch Scene
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button 
              disabled
              variant="outline"
              className="w-full text-muted-foreground"
            >
              <Info size={16} className="mr-2" />
              Scene Preview Unavailable
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneHighlightCard;
