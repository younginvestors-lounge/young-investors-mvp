"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterOptions {
  speed?: number;   // ms per character
  delay?: number;   // ms before starting
}

export function useTypewriter(text: string, { speed = 22, delay = 0 }: TypewriterOptions = {}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    idxRef.current = 0;
    setDisplayed("");
    setDone(false);

    const start = setTimeout(() => {
      const tick = setInterval(() => {
        idxRef.current += 1;
        setDisplayed(textRef.current.slice(0, idxRef.current));
        if (idxRef.current >= textRef.current.length) {
          clearInterval(tick);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(tick);
    }, delay);

    return () => clearTimeout(start);
  }, [text, speed, delay]);

  return { displayed, done };
}
