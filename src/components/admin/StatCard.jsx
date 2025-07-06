// src/components/admin/StatCard.jsx - Mejorado con subtítulos
import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);