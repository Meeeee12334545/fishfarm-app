import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Tanks from './pages/Tanks';
import Health from './pages/Health';
import Feeding from './pages/Feeding';
import WaterQuality from './pages/WaterQuality';
import Inventory from './pages/Inventory';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tanks" element={<Tanks />} />
            <Route path="/health" element={<Health />} />
            <Route path="/feeding" element={<Feeding />} />
            <Route path="/water-quality" element={<WaterQuality />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
