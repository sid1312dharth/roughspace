import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import React, { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { Loader2 } from 'lucide-react';

const Home = React.lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })));
const Documents = React.lazy(() => import('@/pages/Documents').then(module => ({ default: module.Documents })));
const Recent = React.lazy(() => import('@/pages/Recent').then(module => ({ default: module.Recent })));
const Favorites = React.lazy(() => import('@/pages/Favorites').then(module => ({ default: module.Favorites })));
const Trash = React.lazy(() => import('@/pages/Trash').then(module => ({ default: module.Trash })));
const Settings = React.lazy(() => import('@/pages/Settings').then(module => ({ default: module.Settings })));
const Editor = React.lazy(() => import('@/pages/Editor').then(module => ({ default: module.Editor })));
const Login = React.lazy(() => import('@/pages/Login').then(module => ({ default: module.Login })));

const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center h-full min-h-screen bg-[var(--color-bg)]">
    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
  </div>
);

function App() {
  useAuth(); // Initialize auth listener
  useSync(); // Initialize cloud sync

  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="documents" element={<Documents />} />
            <Route path="recent" element={<Recent />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="trash" element={<Trash />} />
            <Route path="settings" element={<Settings />} />
            <Route path="editor/:id" element={<Editor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

