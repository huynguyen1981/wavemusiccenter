import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { lessonService } from '../services/firebaseService';
import { Lesson } from '../types';
import { ChevronLeft, BookOpen, Music, Award, DollarSign, FileText, Calendar, Compass } from 'lucide-react';

const iconMap: Record<string, any> = {
  BookOpen: BookOpen,
  Music: Music,
  Award: Award,
  DollarSign: DollarSign,
  FileText: FileText,
  Calendar: Calendar,
  Compass: Compass,
};

export const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [parent, setParent] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await lessonService.getLessonById(id);
        if (data) {
          setLesson(data);
          
          if (data.parentId) {
            const parentData = await lessonService.getLessonById(data.parentId);
            setParent(parentData);
          } else {
            setParent(null);
          }

          // Fetch siblings or related items
          const allLessons = await lessonService.getAllLessons();
          if (data.parentId) {
            // If child, siblings are items with same parentId
            const related = allLessons.filter(l => l.parentId === data.parentId && l.id !== data.id);
            setSiblings(related);
          } else {
            // If parent, siblings are other parent items
            const related = allLessons.filter(l => !l.parentId && l.id !== data.id);
            setSiblings(related);
          }
        }
      } catch (err) {
        console.error("Error fetching lesson detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-piano-black flex items-center justify-center">
        <div className="text-gold animate-pulse text-lg tracking-widest uppercase font-serif">
          {language === 'en' ? 'Tuning lesson notes...' : 'Đang chuẩn bị giáo trình...'}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-piano-black flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-serif font-bold text-white">
          {language === 'en' ? 'Lesson Not Found' : 'Không tìm thấy nội dung giáo trình'}
        </h2>
        <Link to="/music-center" className="text-gold flex items-center hover:underline font-bold">
          <ChevronLeft className="w-5 h-5 mr-1" /> {language === 'en' ? 'Back to Music Center' : 'Quay lại Trung tâm'}
        </Link>
      </div>
    );
  }

  const title = language === 'en' ? lesson.title_en : lesson.title_vi;
  const subtitle = language === 'en' ? (lesson.subtitle_en || '') : (lesson.subtitle_vi || '');
  const content = language === 'en' ? (lesson.content_en || '') : (lesson.content_vi || '');
  const IconComponent = lesson.icon && iconMap[lesson.icon] ? iconMap[lesson.icon] : BookOpen;

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="text-2xl font-serif font-bold text-gold mt-8 mb-4">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={index} className="text-lg font-serif font-bold text-white mt-6 mb-3">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={index} className="ml-6 list-disc text-white/80 mb-2 leading-relaxed">
            {trimmed.slice(2)}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={index} className="h-4" />;
      }
      return (
        <p key={index} className="text-white/60 leading-relaxed mb-4 text-base">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-piano-black text-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/music-center" 
          className="inline-flex items-center text-white/40 hover:text-gold transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase font-bold tracking-widest">
            {language === 'en' ? 'Back to Music Center' : 'Quay lại Trung tâm'}
          </span>
        </Link>

        {/* Header Breadcrumb */}
        {parent && (
          <div className="flex items-center space-x-2 text-white/30 text-xs uppercase tracking-widest mb-4">
            <Link to={`/lessons/${parent.id}`} className="hover:text-gold transition-colors">
              {language === 'en' ? parent.title_en : parent.title_vi}
            </Link>
            <span>/</span>
            <span className="text-white/60">{title}</span>
          </div>
        )}

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-piano-matte rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 mb-8 relative z-10 border-b border-white/5 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 flex-shrink-0">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gold font-sans text-sm tracking-wider uppercase">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative z-10 text-white/70">
            {content ? (
              <div className="prose prose-invert max-w-none">
                {renderMarkdown(content)}
              </div>
            ) : (
              <p className="italic text-white/40 text-center py-12">
                {language === 'en' ? 'No detail content available.' : 'Nội dung chi tiết đang được cập nhật.'}
              </p>
            )}
          </div>

          {/* Register Button block for programs & enrollment */}
          {(lesson.id.includes('enrollment') || lesson.id.includes('program') || lesson.parentId?.includes('enrollment') || lesson.parentId?.includes('program')) && (
            <div className="mt-12 pt-8 border-t border-white/5 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-serif text-lg font-bold text-white">
                  {language === 'en' ? 'Ready to begin?' : 'Sẵn sàng bắt đầu hành trình của bạn?'}
                </h4>
                <p className="text-white/40 text-xs">
                  {language === 'en' ? 'Connect with our team to find the perfect tutor.' : 'Liên hệ ngay để nhận lộ trình tư vấn cá nhân hóa.'}
                </p>
              </div>
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-piano-black px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-center shadow-lg hover:shadow-gold/20 transition-all"
              >
                {language === 'en' ? 'Register Now' : 'Đăng Ký Học Ngay'}
              </Link>
            </div>
          )}
        </motion.div>

        {/* Siblings / Other Sections */}
        {siblings.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-2xl font-bold mb-6 text-white/80">
              {language === 'en' ? 'Related Sections' : 'Các mục liên quan'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {siblings.slice(0, 4).map((sib) => {
                const sTitle = language === 'en' ? sib.title_en : sib.title_vi;
                const sSubtitle = language === 'en' ? sib.subtitle_en : sib.subtitle_vi;
                return (
                  <Link
                    key={sib.id}
                    to={`/lessons/${sib.id}`}
                    className="p-5 bg-piano-matte rounded-2xl border border-white/5 hover:border-gold/30 hover:bg-white/[0.02] transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-white text-base group-hover:text-gold transition-colors">
                      {sTitle}
                    </span>
                    {sSubtitle && (
                      <span className="text-white/40 text-xs mt-2 line-clamp-1 italic">
                        {sSubtitle}
                      </span>
                    )}
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
