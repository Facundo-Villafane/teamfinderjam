// src/components/admin/AdminTabs.jsx - Con pestaña de usuarios
import React from 'react';
import { 
  BarChart3, 
  Calendar, 
  Shield, 
  Vote, 
  Users, 
  Award,
  UserCog,
  Database
} from 'lucide-react';

export const AdminTabs = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'jams', name: 'Jams', icon: Calendar },
    { id: 'moderation', name: 'Moderación', icon: Shield },
    { id: 'themes', name: 'Temas', icon: Vote },
    { id: 'certificates', name: 'Certificados', icon: Award },
    { id: 'users', name: 'Usuarios', icon: UserCog }, // NUEVA PESTAÑA
    { id: 'migration', name: 'Migración', icon: Database }
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};