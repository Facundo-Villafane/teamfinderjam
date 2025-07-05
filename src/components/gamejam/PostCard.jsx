// src/components/gamejam/PostCard.jsx
import React from 'react';
import { User, Calendar, MapPin, Users, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import { SkillTag } from './SkillTag';

export const PostCard = ({ post, isOwner = false, onEdit, onDelete }) => (
  <div className="bg-gradient-to-br from-amber-900 to-orange-900 border border-orange-500 rounded-lg p-6 text-white relative">
    {isOwner && (
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => onEdit(post)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Editar post"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          title="Eliminar post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}

    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-lg">{post.username}</h3>
        <p className="text-orange-200 text-sm">
          {post.teamMembers && post.teamMembers.length > 0 
            ? `${post.teamMembers.join(', ')} and ${post.memberCount - post.teamMembers.length} others are looking for members`
            : 'is looking for members'
          }
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2 text-orange-200">
        <Users className="w-4 h-4" />
        <span className="text-sm">{post.memberCount}</span>
      </div>
    </div>

    <div className="mb-4">
      <h4 className="font-semibold mb-2 text-orange-200">Looking for:</h4>
      <div className="flex flex-wrap gap-2">
        {post.lookingFor.map(skill => (
          <SkillTag key={skill} skill={skill} />
        ))}
      </div>
    </div>

    <div className="mb-4">
      <h4 className="font-semibold mb-2 text-orange-200">Can do:</h4>
      <div className="flex flex-wrap gap-2">
        {post.canDo.map(skill => (
          <SkillTag key={skill} skill={skill} active />
        ))}
      </div>
    </div>

    {post.tools && post.tools.length > 0 && (
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-orange-200">Tools:</h4>
        <div className="flex flex-wrap gap-2">
          {post.tools.map(tool => (
            <span key={tool} className="px-2 py-1 bg-purple-600 text-white rounded text-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>
    )}

    <div className="mb-4">
      <p className="text-orange-100 leading-relaxed">
        {post.description}
      </p>
    </div>

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 text-orange-200 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{post.timezone}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{post.updatedAt?.toLocaleDateString() || 'Recently'}</span>
        </div>
      </div>
      {!isOwner && (
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors">
          <MessageCircle className="w-4 h-4" />
          Contactar
        </button>
      )}
    </div>
  </div>
);
