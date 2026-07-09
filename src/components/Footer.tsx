import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, Music } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { useLanguage } from '../hooks/useLanguage';
import { getDirectLink } from '../lib/utils';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-piano-matte pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-piano-black rounded-full flex items-center justify-center overflow-hidden border border-white/10">
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
              <span className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
                Wave <span className="text-gold">Music Center</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 italic">
              {t('footer_tagline')}
            </p>
            <div className="flex space-x-4">
              <a href={t('facebook_link')} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-piano-black transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={t('instagram_link')} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-piano-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={t('youtube_link')} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-piano-black transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href={t('tiktok_link')} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold hover:text-piano-black transition-all">
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-white">{t('shop')}</h4>
            <ul className="space-y-4">
              {['grand_pianos', 'upright_pianos', 'digital_pianos'].map((key) => (
                <li key={key}>
                  <Link to={`/collections?category=${key.split('_')[0]}`} className="text-white/50 hover:text-gold text-sm transition-colors">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-white">{t('about')}</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-white/50 hover:text-gold text-sm transition-colors">{t('about')}</Link></li>
              <li><Link to="/contact" className="text-white/50 hover:text-gold text-sm transition-colors">{t('contact')}</Link></li>
              <li><Link to="/admin" className="text-white/50 hover:text-gold text-sm transition-colors">{t('admin')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-white">{t('contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-white/50 text-sm">
                <MapPin className="w-5 h-5 text-gold shrink-0" />
                <span>{t('global_address')}</span>
              </li>
              <li className="flex items-center space-x-3 text-white/50 text-sm">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>{t('global_phone')}</span>
              </li>
              <li className="flex items-center space-x-3 text-white/50 text-sm">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span>{t('global_email')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs">
          <p>© {currentYear} Wave Music Center. {t('all_rights')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold transition-colors">{t('privacy_policy')}</a>
            <a href="#" className="hover:text-gold transition-colors">{t('terms_of_service')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
