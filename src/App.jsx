import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import TeamFinderPage from './pages/TeamFinderPage'
import ThemeVotingPage from './pages/ThemeVotingPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  const { user, loading } = useAuth()
  const adminEmails = ['facundo.tnd@gmail.com', 'admin@example.com']
  const isAdmin = user && adminEmails.includes(user.email)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} isAdmin={isAdmin} />}>
        <Route index element={<Navigate to="/teamfinder" replace />} />
        <Route path="teamfinder" element={<TeamFinderPage user={user} />} />
        <Route path="voting" element={<ThemeVotingPage user={user} />} />
        <Route 
          path="admin" 
          element={
            isAdmin ? (
              <AdminPage user={user} />
            ) : (
              <div className="text-center text-red-400 py-12">
                <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
                <p>No tienes permisos para acceder al panel de administración.</p>
              </div>
            )
          } 
        />
        <Route 
          path="profile" 
          element={
            user ? (
              <ProfilePage user={user} />
            ) : (
              <div className="text-center text-gray-400 py-12">
                <h2 className="text-2xl font-bold mb-4">Inicia Sesión</h2>
                <p>Necesitas iniciar sesión para ver tu perfil.</p>
              </div>
            )
          } 
        />
        <Route 
          path="*" 
          element={
            <div className="text-center text-gray-400 py-12">
              <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
              <p>La página que buscas no existe.</p>
            </div>
          } 
        />
      </Route>
    </Routes>
  )
}

export default App
