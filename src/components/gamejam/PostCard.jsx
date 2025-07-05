// src/components/gamejam/PostCard.jsx - Con contacto e itch.io
import React from 'react';
import { User, Calendar, MapPin, Users, MessageCircle, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { SkillTag } from './SkillTag';
import { ToolTag } from './ToolTag';

// Función helper para crear enlaces de itch.io
const createItchLink = (username) => {
  if (!username) return null;
  // Si ya es un enlace completo, usarlo tal como está
  if (username.includes('http')) return username;
  // Si no, agregar .itch.io
  const cleanUsername = username.replace('.itch.io', ''); // Por si acaso ya lo tiene
  return `https://${cleanUsername}.itch.io`;
};

// Función helper para crear enlaces de contacto
const createContactLink = (type, info) => {
  if (!info) return null;
  
  // Si ya es un enlace, usarlo tal como está
  if (info.includes('http')) return info;
  
  switch(type) {
    case 'whatsapp':
      // Si es un número, crear enlace de WhatsApp
      const phoneNumber = info.replace(/[^\d+]/g, ''); // Solo números y +
      return `https://wa.me/${phoneNumber}`;
    case 'telegram':
      // Si empieza con @, crear enlace de Telegram
      if (info.startsWith('@')) {
        return `https://t.me/${info.substring(1)}`;
      }
      return `https://t.me/${info}`;
    case 'discord':
      // Para Discord solo mostrar el usuario, no hay enlace directo
      return null;
    default:
      return null;
  }
};

// Componente para mostrar contacto
const ContactButton = ({ contactType, contactInfo }) => {
  const link = createContactLink(contactType, contactInfo);
  
  const getContactIcon = () => {
    switch(contactType) {
      case 'whatsapp': return '📱';
      case 'telegram': return '✈️';
      case 'discord': return '💬';
      default: return '📞';
    }
  };

  const getContactLabel = () => {
    switch(contactType) {
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'discord': return 'Discord';
      default: return 'Contactar';
    }
  };

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white hover:opacity-90"
        style={{ backgroundColor: '#0fc064' }}
      >
        <span>{getContactIcon()}</span>
        {getContactLabel()}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  } else {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: '#0fc064' }}>
        <span>{getContactIcon()}</span>
        <div className="text-center">
          <div className="text-xs">{getContactLabel()}</div>
          <div className="text-xs font-mono">{contactInfo}</div>
        </div>
      </div>
    );
  }
};

export const PostCard = ({ post, isOwner = false, onEdit, onDelete }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white relative hover:border-gray-600 transition-colors">
    {isOwner && (
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => onEdit(post)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Editar publicación"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          title="Eliminar publicación"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}

    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0fc064' }}>
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={createItchLink(post.username)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-lg hover:underline flex items-center gap-1"
            style={{ color: '#0fc064' }}
          >
            {post.username}
            <ExternalLink className="w-3 h-3" />
          </a>
          {post.teamMembers && post.teamMembers.length > 0 && (
            <span className="text-gray-400">+</span>
          )}
          {post.teamMembers && post.teamMembers.map((member, index) => (
            <React.Fragment key={member}>
              <a
                href={createItchLink(member.trim())}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline flex items-center gap-1"
                style={{ color: '#0fc064' }}
              >
                {member.trim()}
                <ExternalLink className="w-2 h-2" />
              </a>
              {index < post.teamMembers.length - 1 && <span className="text-gray-400 text-sm">,</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-gray-400 text-sm">
          {post.teamMembers && post.teamMembers.length > 0 
            ? `están buscando miembros para el equipo`
            : 'está buscando miembros para el equipo'
          }
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2 text-gray-400">
        <Users className="w-4 h-4" />
        <span className="text-sm">{post.memberCount}</span>
      </div>
    </div>

    <div className="mb-4">
      <h4 className="font-semibold mb-2 text-gray-300">Busca:</h4>
      <div className="flex flex-wrap gap-2">
        {post.lookingFor.map(skill => (
          <SkillTag key={skill} skill={skill} />
        ))}
      </div>
    </div>

    <div className="mb-4">
      <h4 className="font-semibold mb-2 text-gray-300">Puede hacer:</h4>
      <div className="flex flex-wrap gap-2">
        {post.canDo.map(skill => (
          <SkillTag key={skill} skill={skill} active />
        ))}
      </div>
    </div>

    {post.tools && post.tools.length > 0 && (
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-gray-300">Herramientas:</h4>
        <div className="flex flex-wrap gap-2">
          {post.tools.map(tool => (
            <ToolTag key={tool} tool={tool} active />
          ))}
        </div>
      </div>
    )}

    <div className="mb-4">
      <p className="text-gray-200 leading-relaxed">
        {post.description}
      </p>
    </div>

    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{post.timezone}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{post.updatedAt?.toLocaleDateString() || 'Recientemente'}</span>
        </div>
      </div>
      {!isOwner && post.contactInfo && (
        <ContactButton 
          contactType={post.contactType || 'discord'} 
          contactInfo={post.contactInfo} 
        />
      )}
    </div>
  </div>
);
