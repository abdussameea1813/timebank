
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import SignupPage from './pages/auth/SignupPage.tsx';
import ServiceList from './pages/services/ServiceList.tsx';
import ServiceDetails from './pages/services/ServiceDetails.tsx';
import Navbar from './components/Navbar.tsx';
import ProfilePage from './pages/profile/ProfilePage.tsx';
import CreateService from './pages/services/CreateService.tsx'; 
import EditService from './pages/services/EditService.tsx'; 
import CreateTransaction from './pages/transaction/CreateTransaction.tsx';
import TransactionList from './pages/transaction/TransactionList.tsx';
import TransactionDetails from './pages/transaction/TransactionDetails.tsx';
import TransactionStats from './pages/transaction/TransactionStats.tsx';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="/" element={user ? <ServiceList /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/services/:id" element={user ? <ServiceDetails /> : <Navigate to="/login" />} />
        <Route path="/services/create" element={user ? <CreateService /> : <Navigate to="/login" />} /> 
        <Route path="/services/:id/edit" element={user ? <EditService /> : <Navigate to="/login" />} /> 
        <Route path="/transactions/create/:id" element={user ? <CreateTransaction /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={user ? <TransactionList /> : <Navigate to="/login" />} />
        <Route path="/transactions/:id" element={user ? <TransactionDetails /> : <Navigate to="/login" />} />
        <Route path="/transactions/stats" element={user ? <TransactionStats /> : <Navigate to="/login" />} />
         
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;