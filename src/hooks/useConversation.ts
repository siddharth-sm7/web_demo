import { useState, useCallback } from 'react';
import { Message, RobotState } from '../types';

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Add a new message
  const addMessage = useCallback((text: string, sender: 'user' | 'langpal') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update robot state based on message sender
    if (sender === 'user') {
      setRobotState('thinking');
      // Simulate the thinking state for a short time before speaking
      setTimeout(() => {
        setRobotState('speaking');
      }, 1000);
    } else {
      // After LangPal responds, return to listening state
      setTimeout(() => {
        setRobotState('listening');
      }, 500);
    }
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setRobotState('idle');
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  // Set robot state directly
  const setRobotStateDirectly = useCallback((state: RobotState) => {
    setRobotState(state);
  }, []);

  return {
    messages,
    robotState,
    isSoundEnabled,
    addMessage,
    clearMessages,
    toggleSound,
    setRobotState: setRobotStateDirectly
  };
};