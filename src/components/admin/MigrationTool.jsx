// src/components/admin/MigrationTool.jsx - Herramienta para migrar usuarios existentes
import React, { useState } from 'react';
import { Users, Play, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { migrateExistingUsers, getJamParticipationStats } from '../../firebase/participants';

export const MigrationTool = ({ currentJam, onRefresh }) => {
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadStats = async () => {
    if (!currentJam?.id) return;
    
    try {
      setLoadingStats(true);
      const jamStats = await getJamParticipationStats(currentJam.id);
      setStats(jamStats);
    } catch (error) {
      console.error('Error loading participation stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleMigration = async () => {
    if (!currentJam?.id) return;
    
    const confirmed = window.confirm(
      `¿Migrar automáticamente todos los usuarios que han creado posts en "${currentJam.name}"?\n\n` +
      'Esto los marcará como participantes de la jam.'
    );
    
    if (!confirmed) return;

    try {
      setMigrating(true);
      setMigrationResult(null);
      
      const result = await migrateExistingUsers(currentJam.id);
      setMigrationResult(result);
      
      // Recargar estadísticas
      await loadStats();
      
      // Notificar al componente padre para que actualice datos
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult({
        error: true,
        message: error.message || 'Error durante la migración'
      });
    } finally {
      setMigrating(false);
    }
  };

  // Cargar estadísticas al montar
  React.useEffect(() => {
    loadStats();
  }, [currentJam?.id]);

  if (!currentJam) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800">
            No hay jam activa. Selecciona una jam para migrar usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Migración de Participantes</h3>
          <p className="text-gray-600 text-sm">
            Migrar usuarios existentes que ya tienen posts en "{currentJam.name}"
          </p>
        </div>
      </div>

      {/* Estadísticas actuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participantes Actuales</p>
              <p className="text-2xl font-bold text-blue-600">
                {loadingStats ? '...' : stats?.totalParticipants || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nuevos Hoy</p>
              <p className="text-2xl font-bold text-green-600">
                {loadingStats ? '...' : stats?.recentJoins || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Información sobre la migración */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">¿Qué hace la migración?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Encuentra todos los usuarios que han creado posts en esta jam</li>
          <li>• Los marca automáticamente como "participantes"</li>
          <li>• No afecta a usuarios que ya están marcados como participantes</li>
          <li>• Es seguro ejecutarla múltiples veces</li>
        </ul>
      </div>

      {/* Resultado de migración anterior */}
      {migrationResult && (
        <div className={`border rounded-lg p-4 mb-4 ${
          migrationResult.error 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {migrationResult.error ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <h4 className={`font-semibold ${
              migrationResult.error ? 'text-red-800' : 'text-green-800'
            }`}>
              {migrationResult.error ? 'Error en Migración' : 'Migración Completada'}
            </h4>
          </div>
          
          {migrationResult.error ? (
            <p className="text-red-700 text-sm">{migrationResult.message}</p>
          ) : (
            <div className="text-green-700 text-sm space-y-1">
              <p>✅ {migrationResult.totalUsers} usuarios procesados exitosamente</p>
              <p>✅ Todos los usuarios con posts ahora son participantes oficiales</p>
              <p>✅ Pueden votar por temas y usar todas las funciones</p>
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleMigration}
          disabled={migrating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {migrating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {migrating ? 'Migrando...' : 'Ejecutar Migración'}
        </button>
        
        <button
          onClick={loadStats}
          disabled={loadingStats}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          Actualizar Stats
        </button>
      </div>

      {/* Advertencia */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-yellow-800 text-sm">
            <p className="font-medium">Importante:</p>
            <p>
              Ejecuta esta migración solo una vez por jam, preferiblemente al implementar 
              el sistema de participantes por primera vez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};