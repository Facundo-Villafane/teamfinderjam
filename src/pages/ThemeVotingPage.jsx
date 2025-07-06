import React from 'react'
import { Link } from 'react-router'
import { useJams } from '../hooks/useJams'
import { useAuth } from '../hooks/useAuth'
import { ThemeVoting } from '../components/gamejam/ThemeVoting'

const ThemeVotingPage = ({ user }) => {
  const { currentJam, loading: jamLoading } = useJams()
  const { handleSignIn } = useAuth()

  if (jamLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Cargando jam...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header de la página */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🗳️ Votación de Temas
        </h1>
        <p className="text-gray-300 text-lg mb-4">
          Vota por tu tema favorito para la game jam
        </p>
        {currentJam && (
          <div className="inline-block px-4 py-2 rounded-lg border mb-4" 
               style={{ backgroundColor: '#0fc064', borderColor: '#0fc064' }}>
            <span className="text-white font-semibold">{currentJam.name}</span>
          </div>
        )}
      </div>

      {/* Componente de votación */}
      <ThemeVoting 
        currentJam={currentJam} 
        user={user} 
        onSignIn={handleSignIn} 
      />

      

      {/* Call to action para el team finder */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-600 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          ¿Ya votaste? 🎯
        </h3>
        <p className="text-gray-200 mb-4">
          ¡Ahora encuentra tu equipo perfecto para la jam!
        </p>
        <Link 
          to="/teamfinder" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors text-white hover:opacity-90"
          style={{ backgroundColor: '#0fc064' }}
        >
          🔍 Ir al Team Finder
        </Link>
      </div>
    </div>
  )
}

export default ThemeVotingPage