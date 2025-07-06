// src/pages/ProfilePage.jsx - Actualizado con participación en jams
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Mail, 
  ExternalLink, 
  Edit3, 
  Crown, 
  Trophy,
  Users,
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';
import { getPostsByUser } from '../firebase/firestore';
import { getUserJamHistory } from '../firebase/participants';
import { useJamParticipation } from '../hooks/useJamParticipation';

const ProfilePage = ({ user, currentJam }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalJamsParticipated: 0,
    memberSince: null
  });
  const [jamHistory, setJamHistory] = useState([]);

  // Hook de participación para la jam actual
  const { isJoined: isJoinedCurrentJam } = useJamParticipation(user, currentJam);

  const adminEmails = ['facundo.tnd@gmail.com', 'admin@example.com'];
  const isAdmin = user && adminEmails.includes(user.email);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Cargar posts del usuario
      const posts = await getPostsByUser(user.uid);
      setUserPosts(posts);

      // Cargar historial de jams
      const history = await getUserJamHistory(user.uid);
      setJamHistory(history);

      // Calcular estadísticas
      // Para mantener compatibilidad, también contamos jams únicas de posts
      const uniqueJamsFromPosts = new Set(posts.map(post => post.edition));
      const uniqueJamsFromParticipation = history.length;
      
      // Usar el número mayor (para casos de migración parcial)
      const totalJamsParticipated = Math.max(
        uniqueJamsFromPosts.size,
        uniqueJamsFromParticipation
      );

      setStats({
        totalPosts: posts.length,
        totalJamsParticipated,
        memberSince: user.metadata?.creationTime ? 
          new Date(user.metadata.creationTime) : null
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItchLink = (username) => {
    if (!username) return null;
    if (username.includes('http')) return username;
    const cleanUsername = username.replace('.itch.io', '');
    return `https://${cleanUsername}.itch.io`;
  };

  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJamStatusIcon = (jam) => {
    if (!jam.active) return { icon: Clock, color: 'text-gray-400', text: 'Finalizada' };
    
    const today = new Date();
    const startDate = new Date(jam.startDate);
    const endDate = new Date(jam.endDate);
    
    if (today >= startDate && today <= endDate) {
      return { icon: Play, color: 'text-green-400', text: 'En vivo' };
    } else if (today < startDate) {
      return { icon: Clock, color: 'text-yellow-400', text: 'Próximamente' };
    } else {
      return { icon: CheckCircle, color: 'text-blue-400', text: 'Completada' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    );
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

        {/* Estado de participación en jam actual */}
        {currentJam && (
          <div className="mb-4">
            {isJoinedCurrentJam ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900 border border-green-600">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200 font-semibold">
                  Participando en {currentJam.name}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 border border-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  No participando en {currentJam.name}
                </span>
              </div>
            )}
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
            {stats.memberSince ? 
              formatDate(stats.memberSince).split(' ').slice(-1)[0] : // Solo el año
              'Desconocido'
            }
          </div>
          <p className="text-gray-300">Miembro Desde</p>
        </div>
      </div>

      {/* Historial de Jams */}
      {jamHistory.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6" style={{ color: '#0fc064' }} />
            Historial de Game Jams
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jamHistory.map((jam) => {
              const status = getJamStatusIcon(jam);
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={jam.id} 
                  className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{jam.name}</h3>
                      <p className="text-gray-300 text-sm">{jam.description}</p>
                    </div>
                    {jam.bannerUrl && (
                      <img 
                        src={jam.bannerUrl} 
                        alt={jam.name}
                        className="w-16 h-8 object-cover rounded ml-3"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      <span className="text-gray-300">{status.text}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {jam.startDate} → {jam.endDate}
                      </span>
                    </div>
                    
                    {jam.selectedTheme && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300">Tema: {jam.selectedTheme.title}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        Te uniste el {formatDate(jam.joinedAt)}
                      </span>
                    </div>
                  </div>
                  
                  {jam.jamLink && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <a 
                        href={jam.jamLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver página oficial
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Publicaciones recientes */}
      {userPosts.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Edit3 className="w-6 h-6" style={{ color: '#0fc064' }} />
            Publicaciones Recientes
          </h2>
          
          <div className="space-y-4">
            {userPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{post.edition}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatDate(post.createdAt?.toDate())}</span>
                      {post.username && (
                        <a 
                          href={createItchLink(post.username)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {post.username}.itch.io
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {userPosts.length > 5 && (
              <p className="text-gray-400 text-sm text-center">
                Y {userPosts.length - 5} publicaciones más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mensaje si no hay actividad */}
      {userPosts.length === 0 && jamHistory.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">¡Aún no hay actividad!</h3>
          <p className="text-gray-300 mb-4">
            Participa en una jam y crea tu primera publicación para buscar equipo
          </p>
          {currentJam && !isJoinedCurrentJam && (
            <p className="text-gray-400 text-sm">
              Únete a <strong>{currentJam.name}</strong> para empezar tu aventura
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;