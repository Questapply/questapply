import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (message: string, typingSpeed: number = 30, repeatInterval: number = 10000) => {
  const [typingEffect, setTypingEffect] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const repeatIntervalRef = useRef<NodeJS.Timeout>();
  const messageRef = useRef(message);

  // Update messageRef when message changes
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    const startTyping = () => {
      setTypingEffect('');
      setTypingComplete(false);
      let i = 0;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (i < messageRef.current.length) {
          setTypingEffect(prevText => messageRef.current.substring(0, i + 1));
          i++;
        } else {
          setTypingComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, typingSpeed);
    };

    // Start first typing effect
    startTyping();

    // Set up repeat interval
    repeatIntervalRef.current = setInterval(() => {
      startTyping();
    }, repeatInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
      }
    };
  }, [typingSpeed, repeatInterval]); // Remove message from dependencies

  return { typingEffect, typingComplete };
}; 