import React, { useEffect, useState } from 'react';
import { RobotState } from '../types';
import { Mic, RefreshCw } from 'lucide-react';

interface StatePopupProps {
  state: RobotState;
}

const StatePopup: React.FC<StatePopupProps> = ({ state }) => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle mobile detection safely
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  useEffect(() => {
    // Show popup when state changes to listening or thinking
    if (state === 'listening' || state === 'thinking') {
      setVisible(true);
    } else {
      // Hide popup after a short delay when state changes to something else
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state]);
  
  if (!visible) return null;
  
  const isListening = state === 'listening';
  
  return (
    <div className="z-50">
      <div className={`${
        isListening ? 'bg-green-100 border-green-500' : 'bg-blue-100 border-blue-500'
      } border-l-4 rounded-lg shadow-lg py-2 px-3 md:px-4 flex items-center animate-pulse max-w-xs md:max-w-none`}>
        <div className={`${
          isListening ? 'bg-green-500' : 'bg-blue-500'
        } rounded-full p-1.5 mr-2 flex-shrink-0`}>
          {isListening ? (
            <Mic className="text-white" size={isMobile ? 12 : 16} />
          ) : (
            <RefreshCw className="text-white animate-spin" size={isMobile ? 12 : 16} />
          )}
        </div>
        <div className="min-w-0">
          <p className={`${
            isListening ? 'text-green-800' : 'text-blue-800'
          } font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isListening ? 'Listening...' : 'Processing...'}
          </p>
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } ${isMobile ? 'text-xs' : 'text-xs'} leading-tight`}>
            {isMobile ? (
              // Mobile: Short messages (changable)
              isListening ? 'Thinking💡' : 'Creating magic🪄'
            ) : (
              // Desktop: Full messages
              isListening 
                ? 'Langpals is thinking of the best way to answer to your child💡' 
                : 'Langpals is generating a magical response for your child 🪄'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatePopup;