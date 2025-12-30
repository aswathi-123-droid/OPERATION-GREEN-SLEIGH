import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Zap } from 'lucide-react';
import { Stats } from '../types';

interface JollySantaProps {
  stats: Stats;
}

// Simulated Santa Database (Replaces AI)
const SANTA_QUOTES = [
  "Ho Ho Ho! Sensors indicate high plastic levels in the Pacific. Deploying festive countermeasures!",
  "Rudolph's nose is red, and so are these pollution alerts! Let's get to work, team!",
  "I've checked the list twice. This pollution is definitely on the Naughty List.",
  "Sleigh thrusters are at 98% efficiency. Ready to haul waste to the recycling center!",
  "Eco-Elves report: The northern ice caps are looking cleaner. Keep it up!",
  "Remember, sustainable wrapping paper is the key to a happy planet!",
  "Tactical update: Cookie reserves are low. But morale is high!",
  "Sector 4 looks clear. Excellent work, Commander.",
  "By the beard of St. Nick! That's a lot of waste data incoming!",
  "Green Sleigh to Base: We are green for launch. Let's scrub the skies!"
];

const JollySanta: React.FC<JollySantaProps> = ({ stats }) => {
  const santaRef = useRef<HTMLDivElement>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [message, setMessage] = useState<string>("Click me for a tactical update!");
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Jump Animation Loop
  useEffect(() => {
    if (!santaRef.current || isChatting) return;

    const ctx = gsap.context(() => {
      // Create a repeating timeline
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      timelineRef.current = tl;

      const jumpToRandomSpot = () => {
        // Safe boundaries (keep him on screen)
        const x = Math.random() * (window.innerWidth - 120);
        const y = Math.random() * (window.innerHeight - 120);
        
        // The jump animation
        tl.to(santaRef.current, {
          scaleX: 1.2, scaleY: 0.8, duration: 0.2, ease: "power1.out" // Squash
        })
        .to(santaRef.current, {
          x: x, y: y, scaleX: 0.9, scaleY: 1.1, duration: 0.6, ease: "power2.inOut" // Jump
        })
        .to(santaRef.current, {
          scaleX: 1.1, scaleY: 0.9, duration: 0.1, ease: "power1.out" // Land squash
        })
        .to(santaRef.current, {
          scaleX: 1, scaleY: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" // Recover
        });
      };

      // Add function call to timeline to generate new coords every loop
      tl.call(jumpToRandomSpot);
      
      // Floating hover effect when not jumping
      gsap.to(santaRef.current, {
        y: "+=10",
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    return () => ctx.revert();
  }, [isChatting]);

  const handleClick = () => {
    if (!santaRef.current) return;

    if (!isChatting) {
      // Stop jumping
      if (timelineRef.current) timelineRef.current.pause(); // Kill specific timeline
      gsap.killTweensOf(santaRef.current);

      setIsChatting(true);
      
      // Move to Dock Position (Bottom Right)
      gsap.to(santaRef.current, {
        x: window.innerWidth - 140,
        y: window.innerHeight - 180,
        scale: 1.2,
        duration: 0.8,
        ease: "back.out(1.2)"
      });

      // Select Random Message
      const randomQuote = SANTA_QUOTES[Math.floor(Math.random() * SANTA_QUOTES.length)];
      setMessage(randomQuote);

    } else {
       // Resume jumping
       setIsChatting(false);
       setMessage("Click me for a tactical update!");
    }
  };

  return (
    <>
        {/* Chat Bubble */}
        {isChatting && (
            <div className="fixed bottom-32 right-8 z-[60] max-w-xs animate-[scaleIn_0.3s_ease-out]">
                <div className="bg-slate-900/95 backdrop-blur-md border border-red-500/50 text-white p-4 rounded-2xl rounded-br-none shadow-2xl relative">
                    <button 
                        onClick={handleClick}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400 transition"
                    >
                        <X size={12} />
                    </button>
                    
                    <h4 className="font-orbitron text-red-400 text-xs font-bold mb-1 flex items-center gap-2">
                        <Zap size={12} /> CMDR. CLAUS (ONLINE)
                    </h4>
                    
                    <p className="text-sm font-mono leading-relaxed">
                       {message}
                    </p>
                </div>
            </div>
        )}

        {/* Santa Avatar */}
        <div 
            ref={santaRef}
            onClick={handleClick}
            className="fixed top-20 left-20 z-[50] cursor-pointer group select-none touch-none"
            style={{ willChange: 'transform' }}
        >
            <div className="relative text-[80px] leading-none filter drop-shadow-2xl transition-transform active:scale-90">
                🎅
                {/* Tech Goggles CSS Overlay */}
                <div className="absolute top-[35%] left-[25%] w-[50%] h-[15%] bg-blue-500 mix-blend-screen opacity-80 rounded-sm pointer-events-none animate-pulse"></div>
                <div className="absolute top-[35%] left-[25%] w-[50%] h-[15%] border-t border-b border-blue-200 pointer-events-none"></div>
                
                {/* Status Dot */}
                <div className="absolute top-0 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-bounce"></div>
                
                {!isChatting && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold py-1 px-2 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        Click for Orders!
                    </div>
                )}
            </div>
        </div>
    </>
  );
};

export default JollySanta;