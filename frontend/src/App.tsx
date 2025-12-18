import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { MatrixPage } from './pages/MatrixPage';
import { WeeklyPage } from './components/modules/weekly/index';
import { DashboardPage } from './pages/DashboardPage';
import { ConfigPage } from './pages/ConfigPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MatrixPage />} />
          <Route path="weekly" element={<WeeklyPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
