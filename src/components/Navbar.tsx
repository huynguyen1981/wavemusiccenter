import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, Phone } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { CONTACT_INFO } from '../constants';
import { cn, getDirectLink } from '../lib/utils';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { title: t('home'), path: '/' },
    { title: t('wave_music_center'), path: '/music-center' },
    { title: t('shop'), path: '/collections' },
    { title: t('about'), path: '/about' },
    { title: t('contact'), path: '/contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-piano-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-piano-black rounded-full flex items-center justify-center overflow-hidden border border-gold/20">
               {t('website_logo') ? (
                 <img 
                   src={getDirectLink(t('website_logo'))} 
                   alt="Wave Music Center Logo" 
                   referrerPolicy="no-referrer"
                   className="w-full h-full object-contain p-1" 
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                     (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gold font-serif font-bold text-xl">W</div>';
                   }}
                 />
               ) : (
                 <div className="text-gold font-serif font-bold text-xl">W</div>
               )}
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white uppercase">
              Wave <span className="text-gold">Music Center</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-gold",
                  location.pathname === link.path ? "text-gold" : "text-white/70"
                )}
              >
                {link.title}
              </Link>
            ))}
            
            <div className="h-4 w-[1px] bg-white/20 mx-2" />
            
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center space-x-1 text-xs uppercase tracking-widest text-white/70 hover:text-gold transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>{language === 'en' ? 'VI' : 'EN'}</span>
            </button>
            
            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="bg-gold hover:bg-gold-dark text-piano-black px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105"
            >
              <Phone className="w-4 h-4 inline mr-2" />
              {CONTACT_INFO.phone}
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="text-white/70 hover:text-gold"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gold focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-piano-matte border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-white hover:text-gold border-b border-white/5"
                >
                  {link.title}
                </Link>
              ))}
              <div className="pt-4">
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="w-full flex items-center justify-center bg-gold text-piano-black py-4 rounded-xl font-bold"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
