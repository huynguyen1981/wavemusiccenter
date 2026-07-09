/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Admin } from './pages/Admin';
import { PianoDetail } from './pages/PianoDetail';
import { MusicCenter } from './pages/MusicCenter';
import { EventDetail } from './pages/EventDetail';
import { LessonDetail } from './pages/LessonDetail';
import { LessonClips } from './pages/LessonClips';
import { LessonClipDetail } from './pages/LessonClipDetail';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { SeasonalEffects } from './components/SeasonalEffects';
import { ScrollToTop } from './components/ScrollToTop';

const FaviconManager = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    const logoUrl = t('website_logo');
    if (logoUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement || 
                 document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      link.href = logoUrl;
      // Infer type if possible
      if (logoUrl.endsWith('.png')) link.type = 'image/png';
      else if (logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg')) link.type = 'image/jpeg';
      else if (logoUrl.endsWith('.svg')) link.type = 'image/svg+xml';
    }
  }, [t]);

  return null;
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FaviconManager />
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <SeasonalEffects />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Shop />} />
                <Route path="/collections/:id" element={<PianoDetail />} />
                <Route path="/music-center" element={<MusicCenter />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/lessons/:id" element={<LessonDetail />} />
                <Route path="/lesson-clips" element={<LessonClips />} />
                <Route path="/lesson-clips/:id" element={<LessonClipDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
