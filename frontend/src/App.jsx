import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import DecoButton from './components/DecoButton.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Planning from './pages/Planning.jsx';
import Profil from './pages/Profil.jsx';

function App() {
  const { loading } = useAuth();

  if (loading) return <div><p>Chargement...</p></div>;

  return (
    <>
      <DecoButton />
      <Routes>
        {/* Routes AVEC Header + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profil" element={
            <PrivateRoute>
              <Profil />
            </PrivateRoute>
          } />
          <Route path="/planning" element={
            <PrivateRoute>
              <Planning />
            </PrivateRoute>
          } />
        </Route>

        {/* Routes SANS Header (plein écran) */}
        <Route element={<AuthLayout />}>

        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;