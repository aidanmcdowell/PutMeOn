
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const VideoPlayer = ({ videoId, isOpen, onClose, title }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, videoId]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl p-4">
        <div className="overflow-hidden rounded-lg shadow-2xl animate-scale-in">
          {title && (
            <div className="bg-brand-black-light p-3 flex items-center justify-between">
              <h3 className="font-medium truncate">{title}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-muted-foreground hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
          )}
          
          {/* Video container with aspect ratio */}
          <div className="relative pt-[56.25%] bg-brand-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin" />
              </div>
            )}
            
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500 mb-2">Failed to load video</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
            
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
          
          {!title && (
            <div className="absolute top-2 right-2 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="bg-black/50 hover:bg-black/80 text-white rounded-full h-10 w-10"
              >
                <X size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Backdrop click handler */}
      <div 
        className="absolute inset-0 z-[-1]" 
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default VideoPlayer;
