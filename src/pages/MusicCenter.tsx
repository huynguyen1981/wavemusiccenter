import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Play, Youtube, Music, Calendar, ArrowRight } from 'lucide-react';
import { eventService } from '../services/firebaseService';
import { MusicEvent } from '../types';
import { getDirectLink } from '../lib/utils';

export const MusicCenter: React.FC = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchEvents();
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
        ? `https://img.youtube.com/vi/${event.youtubeId}/maxresdefault.jpg`
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
               src={thumbnail} 
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
                src={t('music_center_hero_img')} 
                alt="Wave Music Center"
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
