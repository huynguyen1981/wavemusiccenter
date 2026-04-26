import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { getDirectLink } from '../lib/utils';

export const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
        >
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight">
                {t('about_title')}
              </h1>
              <div className="w-20 h-1 bg-gold" />
            </div>
            
            <p className="text-xl text-white/70 leading-relaxed font-light italic">
              {t('about_content')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8">
               <div>
                  <p className="text-4xl font-serif font-bold text-gold mb-2">{t('stat_years')}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t('stat_years_label')}</p>
               </div>
               <div>
                  <p className="text-4xl font-serif font-bold text-gold mb-2">{t('stat_students')}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t('stat_students_label')}</p>
               </div>
               <div>
                  <p className="text-4xl font-serif font-bold text-gold mb-2">{t('stat_delivered')}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t('stat_delivered_label')}</p>
               </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
             <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 relative z-10">
                <img 
                   src={getDirectLink(t('about_hero_img'))} 
                   alt="History and Passion" 
                   className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
             </div>
             {/* Decorative elements */}
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold/5 blur-3xl -z-0" />
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 blur-3xl -z-0" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full -z-0 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
