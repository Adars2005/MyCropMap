import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import Header from './components/Header/Header';
import ImageUpload from './components/ImageUpload/ImageUpload';
import FarmMap from './components/FarmMap/FarmMap';
import PlantDetail from './components/PlantDetail/PlantDetail';
import { loadFromCache } from './features/plants/plantSlice';
import './App.css';

function AppContent() {
  const { currentView, theme } = useSelector((state) => state.ui);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load cached plants on mount
    const cached = localStorage.getItem('farmPlants');
    if (cached) {
      try {
        const plants = JSON.parse(cached);
        store.dispatch(loadFromCache(plants));
      } catch (error) {
        console.error('Failed to load cached plants:', error);
      }
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'upload':
        return <ImageUpload />;
      case 'map':
        return <FarmMap />;
      case 'detail':
        return <PlantDetail />;
      default:
        return <ImageUpload />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        {renderView()}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary-green)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error-color)',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
