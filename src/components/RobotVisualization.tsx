import React from 'react';
import { RobotState } from '../types';

interface RobotVisualizationProps {
  state: RobotState;
}

const RobotVisualization: React.FC<RobotVisualizationProps> = ({ state }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white p-4">
      <div className={`relative ${state === 'speaking' ? 'animate-bounce-slow' : ''}`}>
        {/* Robot Body - Blue main body */}
        <div className="w-64 h-64 bg-blue-400 rounded-3xl relative mx-auto">
          {/* Screen/Face */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-gray-200 rounded-xl border-4 border-blue-100 flex items-center justify-center">
            {/* Eyes and mouth change based on state */}
            <div className="flex flex-col items-center">
              <div className="flex space-x-8">
                {/* Left Eye */}
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1"></div>
                </div>
                
                {/* Right Eye */}
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1"></div>
                </div>
              </div>
              
              {/* Mouth changes based on state */}
              {state === 'idle' && (
                <div className="w-16 h-2 bg-black rounded-full mt-4"></div>
              )}
              {state === 'listening' && (
                <div className="w-10 h-10 bg-black rounded-full mt-2 animate-pulse"></div>
              )}
              {state === 'speaking' && (
                <div className="w-16 h-8 bg-black rounded-full mt-2 animate-pulse"></div>
              )}
              {state === 'thinking' && (
                <div className="w-16 h-2 bg-black rounded-md mt-4 animate-pulse"></div>
              )}
            </div>
          </div>
          
          {/* Robot Control Buttons */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <div className="w-8 h-8 bg-yellow-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Robot Hands - Red */}
          <div className="absolute -left-8 top-1/3 w-10 h-10 bg-red-500 rounded-full"></div>
          <div className="absolute -right-8 top-1/3 w-10 h-10 bg-red-500 rounded-full"></div>
          
          {/* Robot Feet - Red */}
          <div className="absolute bottom-0 left-10 w-12 h-12 bg-red-500 rounded-full transform translate-y-1/2"></div>
          <div className="absolute bottom-0 right-10 w-12 h-12 bg-red-500 rounded-full transform translate-y-1/2"></div>
        </div>
        
        {/* Robot State Indicator */}
        <div className="mt-12 text-center">
          <span className={`inline-block px-4 py-1 rounded-full text-white font-medium ${
            state === 'idle' ? 'bg-gray-400' : 
            state === 'listening' ? 'bg-green-500' : 
            state === 'speaking' ? 'bg-blue-500' : 
            'bg-yellow-500'
          }`}>
            {state === 'idle' ? 'Idle' : 
             state === 'listening' ? 'Listening' : 
             state === 'speaking' ? 'Speaking' : 
             'Thinking'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RobotVisualization;