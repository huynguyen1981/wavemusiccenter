import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

export const SeasonalEffects: React.FC = () => {
  const { t } = useLanguage();
  const theme = t('current_theme');
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    if (theme === 'normal') {
      setParticles([]);
      return;
    }

    const count = 30;
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 20, // More spread out
      duration: 15 + Math.random() * 15, // Slower fall
      size: 10 + Math.random() * 20, // Slightly bigger
      landAt: Math.random() > 0.6 ? 40 + Math.random() * 40 : null // 40% chance to "land" between 40-80vh
    }));
    setParticles(newParticles);
  }, [theme]);

  const getParticleIcon = () => {
    switch (theme) {
      case 'christmas': return '❄️';
      case 'spring': return '🌸';
      case 'lunar_new_year': return '🏵️';
      case 'summer': return ['☀️', '🌊', '🌴'][Math.floor(Math.random() * 3)];
      case 'autumn': return ['🍂', '🍁'][Math.floor(Math.random() * 2)];
      case 'july4': return ['🎆', '✨', '🇺🇸'][Math.floor(Math.random() * 3)];
      case 'halloween': return ['🎃', '👻', '🦇'][Math.floor(Math.random() * 3)];
      case 'thanksgiving': return ['🦃', '🥧', '🍂'][Math.floor(Math.random() * 3)];
      default: return '';
    }
  };

  if (theme === 'normal') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={`${theme}-${p.id}`}
            initial={{ y: -50, opacity: 0, x: `${p.x}%`, rotate: 0 }}
            animate={p.landAt ? {
              y: [-50, `${p.landAt}vh`, `${p.landAt}vh`, '110vh'],
              opacity: [0, 1, 1, 0],
              x: [`${p.x}%`, `${p.x + 2}%`, `${p.x + 2}%`, `${p.x + 5}%`],
              rotate: [0, 180, 180, 360]
            } : { 
              y: ['-10vh', '110vh'], 
              opacity: [0, 1, 1, 0],
              x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "easeInOut",
              times: p.landAt ? [0, 0.4, 0.8, 1] : undefined // Stay at landing spot for 40% of duration
            }}
            style={{ 
              fontSize: p.size,
              position: 'absolute',
              filter: theme === 'christmas' ? 'blur(0.5px)' : 'none',
              textShadow: '0 0 10px rgba(255,215,0,0.2)'
            }}
          >
            {getParticleIcon()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
