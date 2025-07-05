// src/components/admin/PostCard.jsx
import React from 'react';
import { Star, Flag, Trash2 } from 'lucide-react';

export const PostCard = ({ post, onToggleFeatured, onToggleFlagged, onDelete }) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold">{post.username}</h4>
          {post.flagged && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
              REPORTADO
            </span>
          )}
          {post.featured && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              DESTACADO
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-2">{post.description}</p>
        <div className="text-sm text-gray-500 mb-2">
          <span>📧 {post.userEmail}</span>
          <span className="mx-2">•</span>
          <span>📅 {post.createdAt?.toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>🎮 {post.edition}</span>
        </div>
        {post.lookingFor && post.lookingFor.length > 0 && (
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">Looking for: </span>
            <span className="text-sm text-gray-600">{post.lookingFor.join(', ')}</span>
          </div>
        )}
        {post.canDo && post.canDo.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700">Can do: </span>
            <span className="text-sm text-gray-600">{post.canDo.join(', ')}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onToggleFeatured(post.id)}
          className={`p-2 rounded ${
            post.featured 
              ? 'text-yellow-600 bg-yellow-100' 
              : 'text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
          }`}
          title="Destacar post"
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleFlagged(post.id)}
          className={`p-2 rounded ${
            post.flagged 
              ? 'text-red-600 bg-red-100' 
              : 'text-gray-400 hover:bg-red-100 hover:text-red-600'
          }`}
          title="Marcar como reportado"
        >
          <Flag className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="p-2 text-red-600 hover:bg-red-100 rounded"
          title="Eliminar post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);