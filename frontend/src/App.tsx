import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import OCRUpload from './pages/OCRUpload';
import FraudReport from './pages/FraudReport';
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
          {/* More routes will be added as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
