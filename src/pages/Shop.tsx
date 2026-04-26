import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pianoService } from '../services/firebaseService';
import { Piano, PianoCategory } from '../types';
import { PianoCard } from '../components/PianoCard';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'motion/react';
import { Search, Filter } from 'lucide-react';

export const Shop: React.FC = () => {
  const [pianos, setPianos] = useState<Piano[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const currentCategory = searchParams.get('category') as PianoCategory || null;

  useEffect(() => {
    const fetchPianos = async () => {
      setLoading(true);
      try {
        const data = await pianoService.getAllPianos(currentCategory || undefined);
        setPianos(data);
      } catch (err) {
        console.error("Failed to fetch pianos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPianos();
  }, [currentCategory]);

  const categories: { id: PianoCategory | null; label: string }[] = [
    { id: null, label: t('all_categories') },
    { id: 'grand', label: t('grand_pianos') },
    { id: 'upright', label: t('upright_pianos') },
    { id: 'digital', label: t('digital_pianos') },
  ];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('collections')}</h1>
          <p className="text-white/50 max-w-xl">
            {t('shop_desc')}
          </p>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id || 'all'}
              onClick={() => {
                if (cat.id) setSearchParams({ category: cat.id });
                else setSearchParams({});
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                currentCategory === cat.id
                  ? 'bg-gold text-piano-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-piano-matte rounded-3xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : pianos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pianos.map((piano, index) => (
            <motion.div
              key={piano.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PianoCard piano={piano} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">{t('no_pianos')}</p>
        </div>
      )}
    </div>
  );
};
