import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

import MainLayout from './layouts/MainLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Planning from './pages/Planning.jsx';
import Profil from './pages/Profil.jsx';
import Admin from './pages/Admin.jsx';

function App() {
  const { loading } = useAuth();

  if (loading) return <div><p>Chargement...</p></div>;

  return (
    <>
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
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;