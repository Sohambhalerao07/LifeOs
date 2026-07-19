import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import Habits from './pages/Habits';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="daily" element={<DailyPlanner />} />
          <Route path="weekly" element={<WeeklyPlanner />} />
          <Route path="habits" element={<Habits />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
