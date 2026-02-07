import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TaskTemplates } from './pages/TaskTemplates';
import { ScheduleConfig } from './pages/ScheduleConfig';
import { MessageConfig } from './pages/MessageConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="templates" element={<TaskTemplates />} />
          <Route path="schedule" element={<ScheduleConfig />} />
          <Route path="notifications" element={<MessageConfig />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;