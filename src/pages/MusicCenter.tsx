import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Play, Youtube, Music, Calendar, ArrowRight, BookOpen, Award, DollarSign, FileText, ChevronRight, Video } from 'lucide-react';
import { eventService, lessonService, lessonClipService } from '../services/firebaseService';
import { MusicEvent, Lesson, LessonClip } from '../types';
import { getDirectLink } from '../lib/utils';

const iconMap: Record<string, any> = {
  BookOpen: BookOpen,
  Music: Music,
  Award: Award,
  DollarSign: DollarSign,
  FileText: FileText,
  Calendar: Calendar,
};

export const MusicCenter: React.FC = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [clips, setClips] = useState<LessonClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingClips, setLoadingClips] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await eventService.getAllEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchLessons = async () => {
      try {
        setLoadingLessons(true);
        let fetched = await lessonService.getAllLessons();
        if (fetched.length === 0) {
          await lessonService.seedDefaultLessons();
          fetched = await lessonService.getAllLessons();
        }
        setLessons(fetched);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      } finally {
        setLoadingLessons(false);
      }
    };

    const fetchClips = async () => {
      try {
        setLoadingClips(true);
        const fetched = await lessonClipService.getAllLessonClips();
        setClips(fetched);
      } catch (err) {
        console.error("Failed to fetch lesson clips:", err);
      } finally {
        setLoadingClips(false);
      }
    };

    fetchEvents();
    fetchLessons();
    fetchClips();
  }, []);

  const now = new Date();
  const upcomingEvents = events
    .filter(e => e.status === 'upcoming' || new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastEvents = events
    .filter(e => e.status === 'completed' || (new Date(e.date) < now && e.status !== 'upcoming'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderEventCard = (event: MusicEvent) => {
    const thumbnail = event.images?.[0] 
      ? getDirectLink(event.images[0])
      : event.youtubeId 
        ? `https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`
        : null;

    return (
      <motion.div 
        key={event.id}
        whileHover={{ y: -10 }}
        className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 shadow-xl group flex flex-col"
      >
        <div className="aspect-video relative overflow-hidden bg-black">
          {thumbnail ? (
            <img 
               src={thumbnail} referrerPolicy="no-referrer" 
               alt={language === 'en' ? event.title_en : event.title_vi} 
               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
               <Music className="w-12 h-12" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-piano-black to-transparent opacity-80" />
          
          {event.status === 'upcoming' && (
            <div className="absolute top-4 right-4 bg-gold text-piano-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg">
               <Play className="w-3 h-3 mr-1 fill-current" />
               {t('status_upcoming')}
            </div>
          )}
        </div>
        <div className="p-8 flex-grow flex flex-col">
           <div className="flex items-center space-x-3 mb-3">
              <p className="text-gold text-[10px] font-bold uppercase tracking-widest flex items-center">
                 <Calendar className="w-3 h-3 mr-2" />
                 {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
           </div>
           <h3 className="text-2xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-gold transition-colors">
              {language === 'en' ? event.title_en : event.title_vi}
           </h3>
           <p className="text-white/40 text-sm line-clamp-2 mb-8 italic">
              {language === 'en' ? event.description_en : event.description_vi}
           </p>
           <div className="mt-auto">
             <Link 
               to={`/events/${event.id}`}
               className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
             >
               {t('view_event_detail')}
               <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
             </Link>
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="bg-piano-matte py-20 px-4 mb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-1/2"
          >
            <div className="flex items-center space-x-2 text-gold mb-4">
              <Music className="w-5 h-5" />
              <span className="uppercase font-bold tracking-[0.2em] text-sm">{t('edu_excellence')}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
               Wave <span className="text-gold">Music</span> Center
            </h1>
            <p className="text-xl text-white/60 mb-8 italic">
               {t('music_center_desc')}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:w-1/2"
          >
            <div className="aspect-video rounded-3xl overflow-hidden bg-piano-black shadow-2xl border border-white/5">
              <img 
                src={getDirectLink(t('music_center_hero_img'))} 
                alt="Wave Music Center"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] -z-0" />
      </section>

      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-6 text-lg text-white/50 leading-relaxed italic">
             <p>
               {t('music_center_intro')}
             </p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-piano-matte p-6 rounded-2xl border border-white/5 text-center">
                 <h4 className="text-3xl font-serif font-bold text-gold mb-1">{t('stat_teachers')}</h4>
                 <p className="text-xs uppercase tracking-widest text-white/40">{t('stat_teachers_label')}</p>
              </div>
              <div className="bg-piano-matte p-6 rounded-2xl border border-white/5 text-center">
                 <h4 className="text-3xl font-serif font-bold text-gold mb-1">{t('stat_students')}</h4>
                 <p className="text-xs uppercase tracking-widest text-white/40">{t('stat_students_label')}</p>
              </div>
              <div className="bg-piano-matte p-6 rounded-2xl border border-white/5 text-center">
                 <h4 className="text-3xl font-serif font-bold text-gold mb-1">{t('stat_events')}</h4>
                 <p className="text-xs uppercase tracking-widest text-white/40">{t('stat_events_label')}</p>
              </div>
              <div className="bg-piano-matte p-6 rounded-2xl border border-white/5 text-center">
                 <h4 className="text-3xl font-serif font-bold text-gold mb-1">{t('stat_dedication')}</h4>
                 <p className="text-xs uppercase tracking-widest text-white/40">{t('stat_dedication_label')}</p>
              </div>
           </div>
        </div>
      </section>

      {/* Educational Lessons Tree Section */}
      <section className="max-w-7xl mx-auto px-4 mb-28">
        <div className="bg-piano-matte rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 blur-[100px] rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative z-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="w-5 h-5 text-gold" />
                </div>
                {language === 'en' ? 'Educational Programs' : 'Chương Trình Đào Tạo'}
              </h2>
            </div>
          </div>

          {loadingLessons ? (
            <div className="py-20 text-center text-gold animate-pulse tracking-widest uppercase text-xs">
              {language === 'en' ? 'Tuning tree diagram...' : 'Đang sắp xếp cây sơ đồ...'}
            </div>
          ) : (
            <div className="relative z-10">
              {/* DESKTOP VIEW (Tree diagram with lines) */}
              <div className="hidden lg:block overflow-x-auto pb-4 -mx-4 px-4 relative z-10">
                {/* min-w-[1140px] container, padded 120px at the top to clear the absolute badge and lines */}
                <div className="min-w-[1140px] pt-[120px] relative">
                  
                  {/* Absolute Connector Infrastructure */}
                  <div className="absolute top-0 left-0 right-0 h-[120px] pointer-events-none">
                    {/* 1. The Badge at the top, perfectly centered */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
                      <div className="bg-white/5 text-white px-8 py-3.5 rounded-3xl border border-white/10 text-center shadow-lg backdrop-blur-sm min-w-[280px]">
                        <h3 className="font-serif text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                          {language === 'en' ? 'Wave Music Center' : 'Trung Tâm Âm Nhạc Wave'}
                        </h3>
                      </div>
                    </div>
                    
                    {/* 2. Vertical stem from the bottom of the badge */}
                    <div className="absolute top-[52px] h-[36px] left-1/2 -translate-x-1/2 w-[2px] bg-gold/20" />
                  </div>
                  
                  {(() => {
                    const parentLessons = lessons
                      .filter(l => !l.parentId)
                      .sort((a, b) => a.order - b.order);
                    const numParents = parentLessons.length;
                    
                    const gridColsClass = 
                      numParents === 1 ? 'grid-cols-1' :
                      numParents === 2 ? 'grid-cols-2' :
                      numParents === 3 ? 'grid-cols-3' :
                      numParents === 4 ? 'grid-cols-4' :
                      numParents === 5 ? 'grid-cols-5' :
                      numParents === 6 ? 'grid-cols-6' :
                      numParents === 7 ? 'grid-cols-7' :
                      numParents === 8 ? 'grid-cols-8' :
                      numParents === 9 ? 'grid-cols-9' :
                      numParents === 10 ? 'grid-cols-10' :
                      numParents === 11 ? 'grid-cols-11' :
                      'grid-cols-12';

                    return (
                      <div className={`grid ${gridColsClass} gap-4 relative pt-8`}>
                        {parentLessons.map((parent, index) => {
                          const parentChildren = lessons
                            .filter(l => l.parentId === parent.id)
                            .sort((a, b) => a.order - b.order);
                          const IconComponent = parent.icon && iconMap[parent.icon] ? iconMap[parent.icon] : BookOpen;
                          
                          return (
                            <div key={parent.id} className="flex flex-col items-stretch relative">
                              
                              {/* Vertical stem line from the horizontal rail down to this parent card */}
                              <div className="w-[2px] h-[64px] bg-gold/20 absolute -top-[64px] left-1/2 -translate-x-1/2 pointer-events-none" />
                              
                              {/* Segmented horizontal bridge line that connects columns beautifully without math errors */}
                              {numParents > 1 && (
                                <div 
                                  className={`absolute -top-[64px] h-[2px] bg-gold/20 pointer-events-none ${
                                    index === 0
                                      ? 'left-1/2 -right-2'
                                      : index === numParents - 1
                                        ? '-left-2 right-1/2'
                                        : '-left-2 -right-2'
                                  }`} 
                                />
                              )}
                              
                              {/* Parent Card with fixed height to ensure perfectly equal row alignment */}
                              <Link 
                                to={`/lessons/${parent.id}`}
                                className="w-full bg-piano-black/60 p-5 rounded-2xl border border-white/5 hover:border-gold/40 hover:bg-white/[0.02] transition-all duration-300 text-center flex flex-col items-center group shadow-md h-[175px] justify-between"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors mb-3">
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <h4 className="font-serif text-[11px] font-bold tracking-wider uppercase text-white group-hover:text-gold transition-colors leading-tight line-clamp-2 text-center flex-grow flex items-center justify-center">
                                  {language === 'en' ? parent.title_en : parent.title_vi}
                                </h4>
                                {(parent.subtitle_en || parent.subtitle_vi) && (
                                  <p className="text-[10px] text-white/40 mt-2 line-clamp-2 h-7 leading-normal">
                                    {language === 'en' ? parent.subtitle_en : parent.subtitle_vi}
                                  </p>
                                )}
                              </Link>
                              
                              {/* If parent has children, draw perfectly aligned vertical stem and children cards in classic tree layout */}
                              {parentChildren.length > 0 && (
                                <div className="w-full relative pl-4 pr-1 border-l-2 border-gold/20 ml-4 mt-6 space-y-2 pb-2">
                                  {/* Vertical line that starts at the top-[-24px] of this container (which is the bottom of the parent card) and meets the border-l-2 */}
                                  <div className="absolute top-[-24px] h-[24px] left-[-2px] w-[2px] bg-gold/20 pointer-events-none" />
                                  
                                  {parentChildren.map((child) => (
                                    <Link
                                      key={child.id}
                                      to={`/lessons/${child.id}`}
                                      className="block relative pl-3 py-2 text-left bg-piano-black/40 rounded-xl border border-white/5 hover:border-gold/40 hover:bg-white/[0.02] transition-all group before:absolute before:-left-4 before:top-1/2 before:w-4 before:h-[2px] before:bg-gold/20 shadow-sm"
                                    >
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70 group-hover:text-gold transition-colors truncate">
                                        {language === 'en' ? child.title_en : child.title_vi}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* MOBILE & TABLET VIEW (Accordion Folders) */}
              <div className="lg:hidden space-y-4">
                {lessons
                  .filter(l => !l.parentId)
                  .sort((a, b) => a.order - b.order)
                  .map((parent) => {
                    const parentChildren = lessons
                      .filter(l => l.parentId === parent.id)
                      .sort((a, b) => a.order - b.order);
                    const IconComponent = parent.icon && iconMap[parent.icon] ? iconMap[parent.icon] : BookOpen;
                    
                    return (
                      <div key={parent.id} className="bg-piano-black/40 rounded-2xl border border-white/5 overflow-hidden">
                        {/* Parent Row */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-serif text-sm font-bold text-white">
                                {language === 'en' ? parent.title_en : parent.title_vi}
                              </h4>
                              {(parent.subtitle_en || parent.subtitle_vi) && (
                                <p className="text-[10px] text-white/40 italic mt-0.5">
                                  {language === 'en' ? parent.subtitle_en : parent.subtitle_vi}
                                </p>
                              )}
                            </div>
                          </div>
                          <Link 
                            to={`/lessons/${parent.id}`}
                            className="text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-full"
                          >
                            {language === 'en' ? 'View' : 'Xem'}
                          </Link>
                        </div>
                        
                        {/* Children list under parent */}
                        {parentChildren.length > 0 && (
                          <div className="p-3 bg-black/15 space-y-2">
                            {parentChildren.map((child) => (
                              <Link
                                key={child.id}
                                to={`/lessons/${child.id}`}
                                className="flex items-center justify-between p-3 bg-piano-matte/50 rounded-xl border border-white/5 hover:border-gold/30 transition-all group"
                              >
                                <span className="text-xs font-bold text-white/70 group-hover:text-gold transition-colors">
                                  {language === 'en' ? child.title_en : child.title_vi}
                                </span>
                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-gold transition-colors group-hover:translate-x-1 transition-transform" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Lesson Clips Section */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
           <h2 className="font-serif text-4xl font-bold flex items-center">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mr-4">
                 <Video className="w-5 h-5 text-gold" />
              </div>
              {t('lesson_clips_title')}
           </h2>
           <Link 
             to="/lesson-clips" 
             className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-gold hover:text-white transition-colors group"
           >
             {language === 'en' ? 'View All' : 'Xem tất cả'}
             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loadingClips ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
             ))
          ) : clips.length > 0 ? (
            clips.slice(0, 3).map((clip) => {
              const clipTitle = language === 'en' ? clip.title_en : clip.title_vi;
              const clipDesc = language === 'en' ? clip.description_en : clip.description_vi;
              const thumbnail = clip.images?.[0] 
                ? getDirectLink(clip.images[0])
                : clip.youtubeId 
                  ? `https://img.youtube.com/vi/${clip.youtubeId}/hqdefault.jpg`
                  : null;

              return (
                <motion.div 
                  key={clip.id}
                  whileHover={{ y: -10 }}
                  className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 shadow-xl group flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-black">
                    {thumbnail ? (
                      <img 
                         src={thumbnail} referrerPolicy="no-referrer" 
                         alt={clipTitle} 
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                         <Music className="w-12 h-12" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-piano-black to-transparent opacity-80" />
                    
                    {/* Floating Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-gold text-piano-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                     <h3 className="text-xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-gold transition-colors line-clamp-1">
                        <Link to={`/lesson-clips/${clip.id}`}>{clipTitle}</Link>
                     </h3>
                     <p className="text-white/40 text-xs line-clamp-2 mb-6 italic leading-relaxed">
                        {clipDesc}
                     </p>
                     <div className="mt-auto">
                       <Link 
                         to={`/lesson-clips/${clip.id}`}
                         className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                       >
                         {language === 'en' ? 'Watch Lesson' : 'Xem bài học'}
                         <Play className="w-3.5 h-3.5 ml-2 fill-current" />
                       </Link>
                     </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-white/20 border border-dashed border-white/5 rounded-3xl italic">
               {language === 'en' ? 'New video lessons are arriving soon!' : 'Các clip bài học sắp sửa ra mắt!'}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
           <h2 className="font-serif text-4xl font-bold flex items-center">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mr-4">
                 <Calendar className="w-5 h-5 text-gold" />
              </div>
              {t('upcoming_events')}
           </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
             ))
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(renderEventCard)
          ) : (
            <div className="col-span-full text-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl italic">
               {t('no_upcoming_events')}
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
           <h2 className="font-serif text-4xl font-bold flex items-center">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mr-4">
                 <Youtube className="w-5 h-5 text-red-600" />
              </div>
              {t('past_events')}
           </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
             ))
          ) : pastEvents.length > 0 ? (
            pastEvents.map(renderEventCard)
          ) : (
            <div className="col-span-full text-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl italic">
               {t('no_past_events')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
