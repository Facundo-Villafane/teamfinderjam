import React from 'react'
import { Link } from 'react-router'
import { 
  X, 
  Users, 
  Vote, 
  Settings, 
  User, 
  LogOut, 
  LogIn,
  ExternalLink,
  Crown
} from 'lucide-react'
import { FaGamepad } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'

export const NavigationMenu = ({ isOpen, onClose, user, isAdmin, currentPath }) => {
  const { handleSignIn, handleSignOut } = useAuth()

  const menuItems = [
    {
      path: '/teamfinder',
      icon: Users,
      title: 'Team Finder',
      description: 'Encuentra tu equipo perfecto',
      color: '#0fc064'
    },
    //{
    //  path: '/voting',
    //  icon: Vote,
    //  title: 'Votación de Temas',
    //  description: 'Vota por el tema de la jam',
    // color: '#8B5CF6'
    //}
  ]

  if (isAdmin) {
    menuItems.push({
      path: '/admin',
      icon: Settings,
      title: 'Administración',
      description: 'Panel de administración',
      color: '#EF4444'
    })
  }

  const handleLinkClick = () => {
    onClose()
  }

  const handleSignOutClick = () => {
    handleSignOut()
    onClose()
  }

  return (
    <>
      {/* Overlay con blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Menu lateral */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50 z-50 transform transition-all duration-300 ease-out shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full text-white">
          {/* Header del menú */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-700/50 transition-all duration-300 delay-100 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                   style={{ backgroundColor: '#0fc064' }}>
                <FaGamepad className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">UTN Game Jam Hub</h2>
                <p className="text-sm text-gray-400">Navega entre secciones</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación principal */}
          <div className={`flex-1 p-4 transition-all duration-300 delay-150 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      isActive 
                        ? 'bg-gray-700/70 border-l-4 shadow-lg' 
                        : 'hover:bg-gray-700/50'
                    }`}
                    style={isActive ? { borderLeftColor: item.color } : {}}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isActive ? item.color : '#374151' }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Enlaces externos */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 px-2">Enlaces Útiles</h4>
              <div className="space-y-2">
                <a
                  href="https://itch.io/jams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02]"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">itch.io Jams</span>
                </a>
                <a
                  href="https://discord.gg/5rk6GyByxE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02]"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Discord Game Dev</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer del menú */}
          <div className={`border-t border-gray-700/50 p-4 transition-all duration-300 delay-200 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    currentPath === '/profile' 
                      ? 'bg-gray-700/70 shadow-lg' 
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: '#0fc064' }}>
                    {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-gray-400">Ver perfil</p>
                  </div>
                  {currentPath === '/profile' && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0fc064' }} />
                  )}
                </Link>
                
                {isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900 border border-yellow-600">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-200 font-medium">Administrador</span>
                  </div>
                )}
                
                <button
                  onClick={handleSignOutClick}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/50 transition-all duration-200 w-full text-left hover:scale-[1.02]"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleSignIn()
                  onClose()
                }}
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left hover:opacity-90 hover:scale-[1.02]"
                style={{ backgroundColor: '#0fc064' }}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}