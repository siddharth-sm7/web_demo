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
      } border-l-4 rounded-lg shadow-lg py-1.5 px-2 flex items-center animate-pulse`}
      style={{ maxWidth: '200px', fontSize: '12px' }}>
        <div className={`${
          isListening ? 'bg-green-500' : 'bg-blue-500'
        } rounded-full p-1 mr-1.5 flex-shrink-0`}>
          {isListening ? (
            <Mic className="text-white" size={10} />
          ) : (
            <RefreshCw className="text-white animate-spin" size={10} />
          )}
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className={`${
            isListening ? 'text-green-800' : 'text-blue-800'
          } font-semibold text-xs leading-tight`}>
            {isListening ? 'Listening...' : 'Processing...'}
          </p>
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } text-xs leading-tight truncate`}>
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