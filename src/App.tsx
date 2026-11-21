import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FirebaseDataProvider } from './context/FirebaseDataContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SavedDrawer } from './components/SavedDrawer';
import { TourGuideModal } from './components/TourGuideModal';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PGDetailsPage } from './pages/PGDetailsPage';
import { LocationsPage } from './pages/LocationsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <FirebaseDataProvider>
          <PreferencesProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[#F5F7FC] text-[#0B1533]">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/pg/:slug" element={<PGDetailsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <SavedDrawer />
              <TourGuideModal />
            </div>
          </PreferencesProvider>
        </FirebaseDataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
