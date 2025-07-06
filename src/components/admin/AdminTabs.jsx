// src/components/admin/AdminTabs.jsx
import React from 'react';
import { BarChart3, Calendar, Shield, Vote, Users, Award } from 'lucide-react';

export const AdminTabs = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'jams', name: 'Jams', icon: Calendar },
    { id: 'moderation', name: 'Moderación', icon: Shield },
    { id: 'themes', name: 'Temas', icon: Vote },
    { id: 'certificates', name: 'Certificados', icon: Award },
    { id: 'migration', name: 'Migración', icon: Users }
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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