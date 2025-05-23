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
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className={`${
        isListening ? 'bg-green-100 border-green-500' : 'bg-blue-100 border-blue-500'
      } border-l-4 rounded-lg shadow-lg py-3 px-5 flex items-center`}>
        <div className={`${
          isListening ? 'bg-green-500' : 'bg-blue-500'
        } rounded-full p-2 mr-3`}>
          {isListening ? (
            <Mic className="text-white animate-pulse" size={24} />
          ) : (
            <RefreshCw className="text-white animate-spin" size={24} />
          )}
        </div>
        <div>
          <p className={`${
            isListening ? 'text-green-800' : 'text-blue-800'
          } font-semibold text-lg`}>
            {isListening ? 'Listening...' : 'Processing...'}
          </p>
          <p className={`${
            isListening ? 'text-green-600' : 'text-blue-600'
          } text-sm`}>
            {isListening 
              ? 'LangPal is listening to you' 
              : 'LangPal is generating a response'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatePopup;