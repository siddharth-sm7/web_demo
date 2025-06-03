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
      } border-l-4 rounded-lg shadow-lg py-2 px-4 flex items-center animate-pulse`}>
        <div className={`${
          isListening ? 'bg-green-500' : 'bg-blue-500'
        } rounded-full p-1.5 mr-2`}>
          {isListening ? (
            <Mic className="text-white" size={16} />
          ) : (
            <RefreshCw className="text-white animate-spin" size={16} />
          )}
        </div>
        <div>
          <p className={`${
            isListening ? 'text-green-800' : 'text-blue-800'
          } font-semibold text-sm`}>
            {isListening ? 'Listening...' : 'Processing...'}
          </p>
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } text-xs`}>
            {isListening 
              ? 'Langpals is thinking of the best way to answer to your child💡' 
              : 'Langpals is generating a magical response for your child 🪄'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatePopup;