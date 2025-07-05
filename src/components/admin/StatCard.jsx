// src/components/admin/StatCard.jsx
import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = "bg-blue-500" }) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);