import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import OCRUpload from './pages/OCRUpload';
import FraudReport from './pages/FraudReport';
import Analysis from './pages/Analysis';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ocr" element={<OCRUpload />} />
          <Route path="/fraud" element={<FraudReport />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
