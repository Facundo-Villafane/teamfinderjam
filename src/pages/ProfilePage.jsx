import React, { useState, useEffect } from 'react'
import { User, Calendar, Mail, ExternalLink, Edit3, Crown } from 'lucide-react'
import { getPostsByUser } from '../firebase/firestore'

const ProfilePage = ({ user }) => {
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalJamsParticipated: 0,
    memberSince: null
  })

  const adminEmails = ['facundo.tnd@gmail.com', 'admin@example.com']
  const isAdmin = user && adminEmails.includes(user.email)

  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const posts = await getPostsByUser(user.uid)
      setUserPosts(posts)

      // Calcular estadísticas
      const uniqueJams = new Set(posts.map(post => post.edition))
      setStats({
        totalPosts: posts.length,
        totalJamsParticipated: uniqueJams.size,
        memberSince: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createItchLink = (username) => {
    if (!username) return null
    if (username.includes('http')) return username
    const cleanUsername = username.replace('.itch.io', '')
    return `https://${cleanUsername}.itch.io`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header del perfil */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4" 
             style={{ backgroundColor: '#0fc064' }}>
          {user.displayName?.charAt(0) || <User className="w-12 h-12" />}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {user.displayName || 'Usuario'}
        </h1>
        <p className="text-gray-300 text-lg mb-4">{user.email}</p>
        
        {isAdmin && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900 border border-yellow-600 mb-4">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 font-semibold">Administrador</span>
          </div>
        )}
      </div>

      {/* Estadísticas del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#0fc064' }}>
            {stats.totalPosts}
          </div>
          <p className="text-gray-300">Publicaciones Creadas</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#8B5CF6' }}>
            {stats.totalJamsParticipated}
          </div>
          <p className="text-gray-300">Jams Participadas</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-lg font-bold mb-2 text-blue-400">
            {stats.memberSince ? stats.memberSince.toLocaleDateString() : 'N/A'}
          </div>
          <p className="text-gray-300">Miembro Desde</p>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" style={{ color: '#0fc064' }} />
          Información del Perfil
        </h3>
        
        <div className="space-y-4 text-gray-300">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>Email: {user.email}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Cuenta creada: {stats.memberSince ? stats.memberSince.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No disponible'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <span>Proveedor: Google</span>
          </div>
        </div>
      </div>

      {/* Historial de publicaciones */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5" style={{ color: '#0fc064' }} />
          Mis Publicaciones ({userPosts.length})
        </h3>
        
        {userPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">Aún no has creado ninguna publicación</p>
            <p className="text-sm">¡Ve al Team Finder y crea tu primera publicación!</p>
            <a 
              href="/teamfinder" 
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:opacity-90"
              style={{ backgroundColor: '#0fc064' }}
            >
              Ir al Team Finder
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div key={post.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={createItchLink(post.username)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold hover:underline flex items-center gap-1"
                        style={{ color: '#0fc064' }}
                      >
                        {post.username}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{post.description}</p>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <div>{post.edition}</div>
                    <div>{post.createdAt?.toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.canDo && post.canDo.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-400 mb-1">Puede hacer:</h5>
                      <div className="flex flex-wrap gap-1">
                        {post.canDo.map(skill => (
                          <span key={skill} className="text-xs px-2 py-1 rounded-full text-white" 
                                style={{ backgroundColor: '#0fc064' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {post.lookingFor && post.lookingFor.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-400 mb-1">Busca:</h5>
                      <div className="flex flex-wrap gap-1">
                        {post.lookingFor.map(skill => (
                          <span key={skill} className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-600 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          🚀 Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/teamfinder" 
            className="flex items-center justify-center gap-2 p-4 rounded-lg font-medium transition-colors text-white hover:opacity-90"
            style={{ backgroundColor: '#0fc064' }}
          >
            🔍 Buscar Equipos
          </a>
          {/*<a 
            href="/voting" 
            className="flex items-center justify-center gap-2 p-4 rounded-lg font-medium transition-colors text-white hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            🗳️ Votar Temas
          </a>*/}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage