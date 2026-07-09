import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { lessonClipService } from '../services/firebaseService';
import { LessonClip } from '../types';
import { ChevronLeft, Play, Search, Video, Music } from 'lucide-react';
import { getDirectLink } from '../lib/utils';

export const LessonClips: React.FC = () => {
  const { t, language } = useLanguage();
  const [clips, setClips] = useState<LessonClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const fetched = await lessonClipService.getAllLessonClips();
        setClips(fetched);
      } catch (err) {
        console.error("Error fetching lesson clips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClips();
  }, []);

  const filteredClips = clips.filter(c => {
    const title = (language === 'en' ? c.title_en : c.title_vi) || '';
    const desc = (language === 'en' ? c.description_en : c.description_vi) || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           desc.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-piano-black text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <Link 
          to="/music-center" 
          className="inline-flex items-center text-white/40 hover:text-gold transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase font-bold tracking-widest">{t('back_to_music_center')}</span>
        </Link>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center space-x-2 text-gold mb-3">
              <Video className="w-5 h-5" />
              <span className="uppercase font-bold tracking-[0.2em] text-xs">Video Vault</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t('lesson_clips_title')}
            </h1>
            <p className="text-white/40 text-sm mt-3 italic max-w-xl">
              {t('lesson_clips_desc')}
            </p>
          </div>

          {/* Clean Search Box */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder={language === 'en' ? 'Search clips...' : 'Tìm kiếm clip học...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-piano-matte border border-white/5 focus:border-gold/30 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredClips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredClips.map((clip) => {
              const title = language === 'en' ? clip.title_en : clip.title_vi;
              const desc = language === 'en' ? clip.description_en : clip.description_vi;
              const thumbnail = clip.images?.[0]
                ? getDirectLink(clip.images[0])
                : clip.youtubeId
                  ? `https://img.youtube.com/vi/${clip.youtubeId}/hqdefault.jpg`
                  : null;

              return (
                <motion.div 
                  key={clip.id}
                  whileHover={{ y: -8 }}
                  className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 shadow-xl group flex flex-col"
                >
                  <Link to={`/lesson-clips/${clip.id}`} className="block relative aspect-video overflow-hidden bg-black flex-shrink-0">
                    {thumbnail ? (
                      <img 
                         src={thumbnail} referrerPolicy="no-referrer" 
                         alt={title} 
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                         <Music className="w-12 h-12" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-piano-black to-transparent opacity-80" />
                    
                    {/* Centered Play Button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-gold text-piano-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  <div className="p-8 flex-grow flex flex-col">
                     <h3 className="text-xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-gold transition-colors line-clamp-1">
                        <Link to={`/lesson-clips/${clip.id}`}>
                          {title}
                        </Link>
                     </h3>
                     <p className="text-white/40 text-xs line-clamp-3 mb-6 italic leading-relaxed">
                        {desc}
                     </p>
                     
                     <div className="mt-auto">
                       <Link 
                         to={`/lesson-clips/${clip.id}`}
                         className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                       >
                         {language === 'en' ? 'Watch Clip' : 'Xem bài học'}
                         <Play className="w-3.5 h-3.5 ml-2 fill-current" />
                       </Link>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-white/20 border border-dashed border-white/5 rounded-[2.5rem] italic">
             {language === 'en' ? 'No video lessons found matching search criteria.' : 'Không tìm thấy clip bài học nào khớp với nội dung tìm kiếm.'}
          </div>
        )}

      </div>
    </div>
  );
};
