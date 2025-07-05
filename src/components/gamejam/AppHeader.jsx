// src/components/gamejam/AppHeader.jsx - Versión en Español
import React from 'react';
import { User, LogOut, LogIn, Settings } from 'lucide-react';

export const AppHeader = ({ user, isAdmin, onSignIn, onSignOut, onOpenAdmin }) => (
  <header className="flex justify-between items-center mb-8">
    <div className="text-center flex-1">
      <h1 className="text-4xl font-bold text-white mb-2">Buscador de Equipos para Game Jams</h1>
      <p className="text-gray-300">¡Encuentra tu equipo perfecto para la game jam!</p>
    </div>
    {user && (
      <div className="flex items-center gap-4 text-white">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0fc064' }}>
          <User className="w-6 h-6" />
        </div>
        <span className="hidden md:inline">{user.displayName}</span>
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Panel de Administración"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onSignOut}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    )}
    {!user && (
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:bg-green-700"
        style={{ backgroundColor: '#0fc064' }}
      >
        <LogIn className="w-5 h-5" />
        Iniciar Sesión
      </button>
    )}
  </header>
);