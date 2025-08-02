// src/components/admin/UsersTab.jsx - Gestión de usuarios para admin
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Edit, 
  Save, 
  X, 
  Mail, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  Download,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getAllUsers,
  getAllUsersComprehensive, 
  updateUserProfile, 
  getUserJamHistory
} from '../../firebase/users';
import { getUserCertificates } from '../../firebase/certificates';
import { getJamParticipants, joinJam, leaveJam } from '../../firebase/participants';

export const UsersTab = ({ currentJam }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, complete, incomplete, participants, non-participants
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingUser, setSavingUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState({});
  const [jamParticipants, setJamParticipants] = useState([]);
  const [managingParticipation, setManagingParticipation] = useState(null);

  useEffect(() => {
    loadUsers();
    if (currentJam?.id) {
      loadJamParticipants();
    }
  }, [currentJam?.id]);

  const loadJamParticipants = async () => {
    if (!currentJam?.id) return;
    try {
      const participants = await getJamParticipants(currentJam.id);
      setJamParticipants(participants.map(p => p.userId));
    } catch (error) {
      console.error('Error loading jam participants:', error);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus, jamParticipants]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener usuarios de forma integral
      let allUsers = await getAllUsersComprehensive();
      
      // Si no se obtuvieron usuarios, intentar método básico
      if (allUsers.length === 0) {
        console.log('Trying basic getAllUsers method...');
        allUsers = await getAllUsers();
      }
      
      console.log(`Total users loaded: ${allUsers.length}`);
      
      // Obtener estadísticas adicionales para cada usuario
      const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const [jamHistory, certificates] = await Promise.all([
              getUserJamHistory(user.id),
              getUserCertificates(user.id)
            ]);
            
            return {
              ...user,
              jamCount: jamHistory.length,
              certificateCount: certificates.length,
              lastActivity: user.updatedAt || user.createdAt || new Date(),
              // Marcar si tiene perfil incompleto
              hasIncompleteProfile: user.missingProfile || !user.fullName || !user.email
            };
          } catch (error) {
            console.error(`Error loading stats for user ${user.id}:`, error);
            return {
              ...user,
              jamCount: 0,
              certificateCount: 0,
              lastActivity: user.createdAt || new Date(),
              hasIncompleteProfile: true
            };
          }
        })
      );
      
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error al cargar usuarios. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(search) ||
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.itchUsername?.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search)
      );
    }

    // Filtrar por estado de perfil y participación
    if (filterStatus === 'complete') {
      filtered = filtered.filter(user => isProfileComplete(user));
    } else if (filterStatus === 'incomplete') {
      filtered = filtered.filter(user => !isProfileComplete(user));
    } else if (filterStatus === 'participants') {
      filtered = filtered.filter(user => jamParticipants.includes(user.id));
    } else if (filterStatus === 'non-participants') {
      filtered = filtered.filter(user => !jamParticipants.includes(user.id));
    }

    setFilteredUsers(filtered);
  };

  const isProfileComplete = (user) => {
    return user.fullName && 
           user.email && 
           user.displayName &&
           user.fullName.trim().split(' ').length >= 2;
  };

  const startEditingUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      fullName: user.fullName || '',
      displayName: user.displayName || '',
      email: user.email || '',
      itchUsername: user.itchUsername || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      twitter: user.twitter || '',
      github: user.github || ''
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const saveUserProfile = async (userId) => {
    try {
      setSavingUser(userId);
      
      // Validaciones básicas
      if (!editForm.email || !editForm.email.includes('@')) {
        alert('Email inválido');
        return;
      }

      await updateUserProfile(userId, {
        ...editForm,
        updatedAt: new Date(),
        adminUpdated: true,
        adminUpdatedAt: new Date()
      });

      // Actualizar el usuario en la lista local
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, ...editForm, updatedAt: new Date() }
          : user
      ));

      setEditingUser(null);
      setEditForm({});
      alert('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSavingUser(null);
    }
  };

  const handleJamParticipation = async (userId, action) => {
    if (!currentJam?.id) {
      alert('No hay jam activa seleccionada');
      return;
    }

    try {
      setManagingParticipation(userId);
      
      if (action === 'add') {
        await joinJam(userId, currentJam.id);
        setJamParticipants(prev => [...prev, userId]);
        alert('Usuario agregado a la jam exitosamente');
      } else if (action === 'remove') {
        if (window.confirm('¿Estás seguro de remover este usuario de la jam? Esto podría afectar sus certificados.')) {
          await leaveJam(userId, currentJam.id);
          setJamParticipants(prev => prev.filter(id => id !== userId));
          alert('Usuario removido de la jam exitosamente');
        }
      }
      
    } catch (error) {
      console.error('Error managing jam participation:', error);
      alert('Error al gestionar la participación en la jam');
    } finally {
      setManagingParticipation(null);
    }
  };

  const isUserParticipant = (userId) => {
    return jamParticipants.includes(userId);
  };

  const toggleUserDetails = (userId) => {
    setShowUserDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getProfileCompletionPercentage = (user) => {
    const fields = ['fullName', 'displayName', 'email', 'itchUsername'];
    const completed = fields.filter(field => user[field] && user[field].trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  const exportUsersData = () => {
    const csvData = users.map(user => ({
      ID: user.id,
      'Nombre Completo': user.fullName || '',
      'Nombre para Mostrar': user.displayName || '',
      'Email': user.email || '',
      'Usuario Itch.io': user.itchUsername || '',
      'Jams Participadas': user.jamCount || 0,
      'Certificados': user.certificateCount || 0,
      'Perfil Completo': isProfileComplete(user) ? 'Sí' : 'No',
      'Fecha Registro': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      'Última Actividad': user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calcular estadísticas de usuarios
  const calculateUserStats = () => {
    return {
      total: users.length,
      complete: users.filter(isProfileComplete).length,
      incomplete: users.filter(user => !isProfileComplete(user)).length,
      participants: jamParticipants.length,
      nonParticipants: users.length - jamParticipants.length,
      activeThisMonth: users.filter(user => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return user.lastActivity && new Date(user.lastActivity) > lastMonth;
      }).length
    };
  };

  const statsData = calculateUserStats();

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gestión de Usuarios</h3>
              <p className="text-gray-400 text-sm">
                {currentJam ? `Administra usuarios - Jam: ${currentJam.name}` : 'Administra perfiles y información de usuarios'}
              </p>
            </div>
          </div>
          
          <button
            onClick={exportUsersData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Usuarios</p>
                <p className="text-2xl font-bold text-white">{statsData.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">En la Jam</p>
                <p className="text-2xl font-bold text-green-400">{statsData.participants}</p>
              </div>
              <UserPlus className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Fuera de la Jam</p>
                <p className="text-2xl font-bold text-orange-400">{statsData.nonParticipants}</p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Perfiles Completos</p>
                <p className="text-2xl font-bold text-purple-400">{statsData.complete}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Activos (mes)</p>
                <p className="text-2xl font-bold text-yellow-400">{statsData.activeThisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Todos los usuarios</option>
              <option value="participants">En la jam actual</option>
              <option value="non-participants">Fuera de la jam</option>
              <option value="complete">Perfiles completos</option>
              <option value="incomplete">Perfiles incompletos</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  {/* Información básica del usuario */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {(user.displayName || user.fullName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">
                          {user.displayName || user.fullName || `Usuario ${user.id.slice(0, 8)}`}
                          {user.fromParticipants && (
                            <span className="ml-2 px-2 py-1 bg-blue-700 text-blue-200 text-xs rounded">
                              Participante
                            </span>
                          )}
                          {user.missingProfile && (
                            <span className="ml-2 px-2 py-1 bg-red-700 text-red-200 text-xs rounded">
                              Sin perfil
                            </span>
                          )}
                        </h4>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          isProfileComplete(user) 
                            ? 'bg-green-900 text-green-300 border border-green-600'
                            : 'bg-yellow-900 text-yellow-300 border border-yellow-600'
                        }`}>
                          {isProfileComplete(user) ? 'Completo' : 'Incompleto'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getProfileCompletionPercentage(user)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email || 'Sin email'}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          ID: {user.id.slice(0, 8)}...
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.jamCount || 0} jams
                        </div>
                        {currentJam && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            isUserParticipant(user.id)
                              ? 'bg-green-900 text-green-300 border border-green-600'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {isUserParticipant(user.id) ? '✓ En la jam' : '✗ Fuera de la jam'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    {/* Gestión de participación en jam */}
                    {currentJam && (
                      <div className="flex items-center gap-2">
                        {isUserParticipant(user.id) ? (
                          <button
                            onClick={() => handleJamParticipation(user.id, 'remove')}
                            disabled={managingParticipation === user.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remover de la jam"
                          >
                            {managingParticipation === user.id ? '...' : 'Remover'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJamParticipation(user.id, 'add')}
                            disabled={managingParticipation === user.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Agregar a la jam"
                          >
                            {managingParticipation === user.id ? '...' : 'Agregar'}
                          </button>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => toggleUserDetails(user.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Ver detalles"
                    >
                      {showUserDetails[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    {editingUser === user.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveUserProfile(user.id)}
                          disabled={savingUser === user.id}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded disabled:opacity-50"
                          title="Guardar cambios"
                        >
                          {savingUser === user.id ? (
                            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingUser(user)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded"
                        title="Editar perfil"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Detalles expandidos */}
                {showUserDetails[user.id] && (
                  <div className="mt-4 pl-14 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div><span className="text-gray-400">Nombre completo:</span> <span className="text-white">{user.fullName || 'No especificado'}</span></div>
                      <div><span className="text-gray-400">Usuario itch.io:</span> <span className="text-white">{user.itchUsername || 'No especificado'}</span></div>
                      <div><span className="text-gray-400">Ubicación:</span> <span className="text-white">{user.location || 'No especificada'}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div><span className="text-gray-400">Certificados:</span> <span className="text-white">{user.certificateCount || 0}</span></div>
                      <div><span className="text-gray-400">Registrado:</span> <span className="text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocido'}</span></div>
                      <div><span className="text-gray-400">Última actividad:</span> <span className="text-white">{user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Desconocida'}</span></div>
                    </div>
                  </div>
                )}

                {/* Formulario de edición */}
                {editingUser === user.id && (
                  <div className="mt-4 pl-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Nombre completo *</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Nombre Apellido"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Nombre para mostrar *</label>
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="NombreUsuario"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Email *</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="usuario@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Usuario itch.io</label>
                        <input
                          type="text"
                          value={editForm.itchUsername}
                          onChange={(e) => setEditForm(prev => ({ ...prev, itchUsername: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="mi-usuario"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Ubicación</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Ciudad, País"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Sitio web</label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                          placeholder="https://mi-sitio.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};