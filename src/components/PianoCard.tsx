import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Piano } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice, cn, getDirectLink } from '../lib/utils';

interface PianoCardProps {
  piano: Piano;
}

export const PianoCard: React.FC<PianoCardProps> = ({ piano }) => {
  const { language, t } = useLanguage();

  const imgUrl = getDirectLink(piano.images[0]) || 'https://images.unsplash.com/photo-1520529611473-5181b3fe7231?auto=format&fit=crop&q=80&w=800';

  const statusColors = {
    'available': 'bg-green-500',
    'sold': 'bg-red-500',
    'reserved': 'bg-yellow-500',
    'coming-soon': 'bg-blue-500',
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imgUrl}
          alt={language === 'en' ? piano.title_en : piano.title_vi}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg",
            statusColors[piano.status]
          )}>
            {t(piano.status.replace('-', '_'))}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-gold text-xs font-bold uppercase tracking-widest">{piano.brand}</p>
          <p className="text-white/40 text-[10px] font-mono">{piano.model}</p>
        </div>
        <h3 className="font-serif text-xl font-bold mb-4 line-clamp-1">
          {language === 'en' ? piano.title_en : piano.title_vi}
        </h3>
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <span className="text-xl font-serif font-bold text-white">
            {formatPrice(piano.price)}
          </span>
          <Link
            to={`/collections/${piano.id}`}
            className="text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
          >
            {t('view_details')}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
