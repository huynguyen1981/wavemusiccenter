import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Music, ShieldCheck, Truck, GraduationCap, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { getDirectLink } from '../lib/utils';

export const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[110vh] pt-24 pb-32 flex items-center justify-center z-20">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url("${getDirectLink(t('home_hero_img'))}")`,
              filter: 'brightness(0.3)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-piano-black/60 via-transparent to-piano-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo above Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 relative group rounded-full bg-black border-2 border-gold/30 flex items-center justify-center shadow-2xl overflow-hidden">
                {t('website_logo') ? (
                  <img 
                    src={getDirectLink(t('website_logo'))} 
                    alt="Wave Music Center Logo" 
                    className="w-full h-full object-contain relative z-10 p-4 md:p-6 mix-blend-lighten group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gold font-serif font-bold text-8xl h-full flex items-center justify-center">W</div>';
                    }}
                  />
                ) : (
                  <div className="text-gold font-serif font-bold text-8xl h-full flex items-center justify-center relative z-10">W</div>
                )}
                {/* Subtle inner glow overlay */}
                <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-500" />
              </div>
            </motion.div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight whitespace-pre-line">
              {(() => {
                const title = t('hero_title');
                // Handle literal \n string coming from translations and force split for beauty
                let processed = title.replace(/\\n/g, '\n');
                
                if (!processed.includes('\n')) {
                  if (processed.includes('hành trình ')) {
                    processed = processed.replace('hành trình ', 'hành trình\n');
                  } else if (processed.includes('Musical ')) {
                    processed = processed.replace('Musical ', 'Musical\n');
                  } else if (processed.includes('Your ')) {
                    processed = processed.replace('Your ', 'Your\n');
                  }
                }
                return processed;
              })()}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 font-light tracking-wide italic">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12">
              <Link
                to="/collections"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-lg border border-white/20 transition-all text-center"
              >
                {t('shop')}
              </Link>
              <Link
                to="/music-center"
                className="w-full lg:scale-110 sm:w-auto bg-gold hover:bg-gold-dark text-piano-black px-12 py-6 rounded-full font-bold text-xl shadow-[0_0_50px_rgba(255,215,0,0.4)] transition-all transform hover:scale-115 active:scale-95 text-center"
              >
                {t('wave_music_center')}
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-lg border border-white/20 transition-all text-center"
              >
                {t('contact')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gold/50"
        >
          <div className="w-6 h-10 border-2 border-gold/30 rounded-full flex justify-center p-2">
            <div className="w-1 h-2 bg-gold/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-piano-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl bg-piano-matte border border-white/5 hover:border-gold/30 transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                <ShieldCheck className="w-8 h-8 text-gold group-hover:text-piano-black" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 leading-tight whitespace-pre-line">
                {t('quality_title').includes('Chất lượng') ? t('quality_title').replace('Chất lượng ', 'Chất lượng\n') : t('quality_title').replace(' ', '\n')}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {t('quality_desc')}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-piano-matte border border-white/5 hover:border-gold/30 transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                <GraduationCap className="w-8 h-8 text-gold group-hover:text-piano-black" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 leading-tight whitespace-pre-line">
                {t('teaching_title').includes('Giảng Dạy') ? t('teaching_title').replace('Giảng Dạy ', 'Giảng Dạy\n') : t('teaching_title').replace(' ', '\n')}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {t('teaching_desc')}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-piano-matte border border-white/5 hover:border-gold/30 transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                <Music className="w-8 h-8 text-gold group-hover:text-piano-black" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 leading-tight whitespace-pre-line">
                {t('tuning_title').includes('Lên dây') ? t('tuning_title').replace('Lên dây ', 'Lên dây\n') : t('tuning_title').replace(' ', '\n')}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {t('tuning_desc')}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-piano-matte border border-white/5 hover:border-gold/30 transition-all group flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                <Truck className="w-8 h-8 text-gold group-hover:text-piano-black" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 leading-tight whitespace-pre-line">
                {t('delivery_title').includes('Vận chuyển') ? t('delivery_title').replace('Vận chuyển ', 'Vận chuyển\n') : t('delivery_title').replace(' ', '\n')}
              </h3>
              <p className="text-white/50 leading-relaxed">
                {t('delivery_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className="py-24 bg-piano-matte overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">
                {t('craft_title')} <span className="text-gold">{t('craft_elegance')}</span>
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
                {t('craft_desc')}
              </p>
              <Link 
                to="/music-center" 
                className="inline-flex items-center space-x-3 text-gold font-bold text-lg hover:translate-x-2 transition-transform"
              >
                <span>{t('browse_collection')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-700">
                 <img 
                    src={getDirectLink(t('discover_img'))} 
                    alt={t('piano_alt')}
                    className="w-full h-auto"
                 />
               </div>
               <div className="absolute -top-6 -right-6 w-full h-full bg-gold/10 rounded-3xl -z-0 lg:rotate-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
