import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Settings from './pages/Settings';
import History from './pages/History';

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
        <Toaster position="bottom-right" />
      </HashRouter>
    </ErrorBoundary>
  );
}
