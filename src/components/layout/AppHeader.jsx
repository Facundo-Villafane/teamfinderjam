import React from 'react'
import { Link } from 'react-router'
import { Menu, User, LogIn } from 'lucide-react'
import { FaGamepad } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'

const getPageTitle = (path) => {
  switch (path) {
    case '/teamfinder':
      return 'Team Finder'
    case '/voting':
      return 'Votación de Temas'
    case '/admin':
      return 'Panel de Administración'
    case '/profile':
      return 'Mi Perfil'
    default:
      return 'Game Jam Hub'
  }
}

export const AppHeader = ({ user, isAdmin, onMenuToggle, currentPath }) => {
  const { handleSignIn } = useAuth()
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo/Título y Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
            title="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/teamfinder" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                 style={{ backgroundColor: '#0fc064' }}>
              <FaGamepad className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">UTN Game Jam Hub</h1>
              <p className="text-sm text-gray-400">{getPageTitle(currentPath)}</p>
            </div>
          </Link>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
                   style={{ backgroundColor: '#0fc064' }}>
                {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:opacity-90"
              style={{ backgroundColor: '#0fc064' }}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}