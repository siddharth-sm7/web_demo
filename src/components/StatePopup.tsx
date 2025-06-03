import React, { useEffect, useState } from 'react';
import { RobotState } from '../types';
import { Mic, RefreshCw } from 'lucide-react';

interface StatePopupProps {
  state: RobotState;
}

const StatePopup: React.FC<StatePopupProps> = ({ state }) => {
  const [visible, setVisible] = useState(false);
  
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
      } border-l-4 rounded-lg shadow-lg py-1.5 md:py-2 px-2 md:px-4 flex items-center animate-pulse max-w-xs md:max-w-none`}>
        <div className={`${
          isListening ? 'bg-green-500' : 'bg-blue-500'
        } rounded-full p-1 md:p-1.5 mr-1.5 md:mr-2 flex-shrink-0`}>
          {isListening ? (
            <Mic className="text-white" size={12} />
          ) : (
            <RefreshCw className="text-white animate-spin" size={12} />
          )}
        </div>
        <div className="min-w-0">
          <p className={`${
            isListening ? 'text-green-800' : 'text-blue-800'
          } font-semibold text-xs md:text-sm`}>
            {isListening ? 'Listening...' : 'Processing...'}
          </p>
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } text-xs leading-tight hidden md:block`}>
            {isListening 
              ? 'Langpals is thinking of the best way to answer to your child💡' 
              : 'Langpals is generating a magical response for your child 🪄'}
          </p>
          {/* Shorter mobile text */}
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } text-xs leading-tight md:hidden`}>
            {isListening 
              ? 'Thinking💡' 
              : 'Creating magic🪄'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatePopup;