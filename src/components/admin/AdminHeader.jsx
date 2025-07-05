// src/components/admin/AdminHeader.jsx
import React from 'react';
import { Shield } from 'lucide-react';

export const AdminHeader = ({ user, onClose }) => (
  <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-orange-600" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <span className="text-sm text-gray-500">Hola, {user.displayName}</span>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Volver a la app
        </button>
      </div>
    </div>
  </div>
);