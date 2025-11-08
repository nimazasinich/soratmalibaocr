import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* More routes will be added in upcoming phases */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
