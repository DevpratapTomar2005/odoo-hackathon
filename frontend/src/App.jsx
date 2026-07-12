import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        
          
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      
        
        <Route element={<ProtectedRoute allowedRoles={['fleet_manager', 'driver']} />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;