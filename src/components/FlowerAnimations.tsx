import { useEffect, useState } from "react";

interface Flower {
  id: number;
  type: 'tulip' | 'lily';
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export function FlowerAnimations() {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  useEffect(() => {
    const createFlower = () => {
      const flower: Flower = {
        id: Math.random(),
        type: Math.random() > 0.5 ? 'tulip' : 'lily',
        x: Math.random() * (window.innerWidth - 50),
        y: -50,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.4,
      };
      
      setFlowers(prev => [...prev, flower]);
      
      setTimeout(() => {
        setFlowers(prev => prev.filter(f => f.id !== flower.id));
      }, 4000);
    };

    const interval = setInterval(createFlower, 1200);
    
    return () => clearInterval(interval);
  }, []);

  const TulipSVG = ({ flower }: { flower: Flower }) => (
    <div
      className="fixed pointer-events-none z-10 animate-bounce"
      style={{
        left: flower.x,
        top: flower.y,
        transform: `rotate(${flower.rotation}deg) scale(${flower.scale})`,
        animation: `fall 4s linear forwards`,
      }}
    >
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
        <path
          d="M15 35C15 35 12 30 12 25C12 20 15 15 15 15C15 15 18 20 18 25C18 30 15 35 15 35Z"
          fill="#22c55e"
        />
        <ellipse cx="15" cy="12" rx="8" ry="12" fill="var(--primary)" opacity="0.9"/>
        <ellipse cx="12" cy="10" rx="6" ry="10" fill="var(--secondary)" opacity="0.8"/>
        <ellipse cx="18" cy="10" rx="6" ry="10" fill="var(--accent)" opacity="0.8"/>
        <ellipse cx="15" cy="8" rx="5" ry="8" fill="var(--primary)" opacity="0.9"/>
      </svg>
    </div>
  );

  const LilySVG = ({ flower }: { flower: Flower }) => (
    <div
      className="fixed pointer-events-none z-10 animate-pulse"
      style={{
        left: flower.x,
        top: flower.y,
        transform: `rotate(${flower.rotation}deg) scale(${flower.scale})`,
        animation: `fall 4s linear forwards`,
      }}
    >
      <svg width="35" height="35" viewBox="0 0 35 35" fill="none">
        <path
          d="M17.5 17.5L10 5C10 5 15 10 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <path
          d="M17.5 17.5L30 5C30 5 25 10 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <path
          d="M17.5 17.5L30 30C30 30 25 25 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <path
          d="M17.5 17.5L10 30C10 30 15 25 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <path
          d="M17.5 17.5L5 10C5 10 10 15 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <path
          d="M17.5 17.5L5 25C5 25 10 20 17.5 17.5Z"
          fill="#ffffff"
          stroke="var(--primary)"
          strokeWidth="1"
        />
        <circle cx="17.5" cy="17.5" r="3" fill="var(--accent)"/>
      </svg>
    </div>
  );

  return (
    <>
      {flowers.map(flower => 
        flower.type === 'tulip' ? (
          <TulipSVG key={flower.id} flower={flower} />
        ) : (
          <LilySVG key={flower.id} flower={flower} />
        )
      )}
    </>
  );
}
