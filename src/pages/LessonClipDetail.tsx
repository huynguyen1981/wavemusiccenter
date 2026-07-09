import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { lessonClipService } from '../services/firebaseService';
import { LessonClip } from '../types';
import { ChevronLeft, Youtube, Play, ChevronRight, Video, FileText } from 'lucide-react';
import { getDirectLink } from '../lib/utils';

export const LessonClipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [clip, setClip] = useState<LessonClip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<'video' | number>('video');
  const [relatedClips, setRelatedClips] = useState<LessonClip[]>([]);

  useEffect(() => {
    const fetchClipData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await lessonClipService.getLessonClipById(id);
        if (data) {
          setClip(data);
          if (!data.youtubeId && data.images?.length > 0) {
            setActiveMedia(0);
          }
          
          // Fetch related clips
          const allClips = await lessonClipService.getAllLessonClips();
          setRelatedClips(allClips.filter(c => c.id !== id).slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching lesson clip detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClipData();
  }, [id]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white/20 animate-pulse">{t('loading')}</div>;
  }

  if (!clip) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-piano-black">
        <h2 className="text-3xl font-serif font-bold text-white">Lesson Clip Not Found</h2>
        <Link to="/lesson-clips" className="text-gold flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Lesson Clips
        </Link>
      </div>
    );
  }

  const title = language === 'en' ? clip.title_en : clip.title_vi;
  const description = language === 'en' ? clip.description_en : clip.description_vi;

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-piano-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Link */}
        <Link to="/lesson-clips" className="inline-flex items-center text-white/40 hover:text-gold transition-colors mb-8 group">
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase font-bold tracking-widest">{language === 'en' ? 'All Lesson Clips' : 'Tất cả clip bài học'}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Media Section */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-3xl overflow-hidden bg-piano-matte border border-white/5 shadow-2xl relative group"
            >
              {activeMedia === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${clip.youtubeId}`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={activeMedia}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={getDirectLink(clip.images[activeMedia as number])} 
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {clip.images.length > 1 && (
                    <>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMedia((prev) => (typeof prev === 'number' && prev > 0 ? prev - 1 : clip.images.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full text-white opacity-60 hover:opacity-100 hover:bg-gold hover:text-piano-black transition-all z-10 shadow-xl"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMedia((prev) => (typeof prev === 'number' && prev < clip.images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full text-white opacity-60 hover:opacity-100 hover:bg-gold hover:text-piano-black transition-all z-10 shadow-xl"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </>
              )}
            </motion.div>

            {/* Media Selector */}
            <div className="flex flex-wrap gap-3">
              {clip.youtubeId && (
                <button 
                  onClick={() => setActiveMedia('video')}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all relative ${activeMedia === 'video' ? 'border-gold scale-105' : 'border-white/5 opacity-50'}`}
                >
                  <img src={`https://img.youtube.com/vi/${clip.youtubeId}/0.jpg`} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Video" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </button>
              )}
              {clip.images?.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveMedia(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === idx ? 'border-gold scale-105' : 'border-white/5 opacity-50'}`}
                >
                  <img src={getDirectLink(img)} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={`Clip view ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
                <Video className="w-3.5 h-3.5 mr-1" />
                {language === 'en' ? 'Clip' : 'Video Bài Học'}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
              {title}
            </h1>

            <div className="prose prose-invert max-w-none text-white/60 leading-relaxed text-base italic whitespace-pre-wrap">
              {description || (language === 'en' ? 'No detail description provided.' : 'Chưa có thông tin mô tả chi tiết bài học.')}
            </div>

            {/* Quick Consultation Register */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-sm font-bold text-white">
                  {language === 'en' ? 'Want to learn this piece?' : 'Bạn muốn học tác phẩm này?'}
                </h4>
                <p className="text-white/40 text-xs">
                  {language === 'en' ? 'Get a personalized lesson plan today.' : 'Nhận lộ trình tập luyện cá nhân hóa ngay hôm nay.'}
                </p>
              </div>
              <Link 
                to="/contact"
                className="bg-gold hover:bg-gold/90 text-piano-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all"
              >
                {t('order_now')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Related Clips */}
        {relatedClips.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-16">
            <h3 className="font-serif text-2xl font-bold mb-10 text-white">
              {language === 'en' ? 'More Video Lessons' : 'Các clip bài học khác'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedClips.map((r) => {
                const rTitle = language === 'en' ? r.title_en : r.title_vi;
                const rThumbnail = r.images?.[0]
                  ? getDirectLink(r.images[0])
                  : r.youtubeId
                    ? `https://img.youtube.com/vi/${r.youtubeId}/hqdefault.jpg`
                    : null;
                return (
                  <Link 
                    key={r.id}
                    to={`/lesson-clips/${r.id}`}
                    className="group bg-piano-matte rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-gold/30 transition-all duration-300"
                  >
                    <div className="aspect-video relative overflow-hidden bg-black flex-shrink-0">
                      {rThumbnail && (
                        <img src={rThumbnail} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt={rTitle} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-all">
                        <Play className="w-8 h-8 text-gold fill-current" />
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                        {rTitle}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
