// src/components/admin/OverviewTab.jsx
import React from 'react';
import { Users, BarChart3, Calendar, ExternalLink } from 'lucide-react';
import { StatCard } from './StatCard';

export const OverviewTab = ({ stats, jams }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers || 0} 
        icon={Users} 
        color="bg-blue-500"
      />
      <StatCard 
        title="Total Posts" 
        value={stats.totalPosts || 0} 
        icon={BarChart3} 
        color="bg-green-500"
      />
      <StatCard 
        title="Active Jams" 
        value={stats.activeJams || 0} 
        icon={Calendar} 
        color="bg-orange-500"
      />
      <StatCard 
        title="Total Jams" 
        value={stats.totalJams || 0} 
        icon={Calendar} 
        color="bg-purple-500"
      />
    </div>

    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Jam Activa</h3>
      {jams.find(j => j.active) ? (
        <div className="space-y-4">
          {jams.filter(j => j.active).map(jam => (
            <div key={jam.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src={jam.bannerUrl || 'https://via.placeholder.com/128x64/orange/white?text=No+Banner'} 
                  alt={jam.name} 
                  className="h-16 w-32 object-cover rounded" 
                />
                <div>
                  <h4 className="font-semibold">{jam.name}</h4>
                  <p className="text-gray-600 text-sm">{jam.description}</p>
                  <p className="text-sm"><strong>Tema:</strong> {jam.theme || 'No definido'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>📅 {jam.startDate} → {jam.endDate}</span>
                {jam.jamLink && (
                  <a href={jam.jamLink} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Ver jam original
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay jams activas</p>
      )}
    </div>
  </div>
);