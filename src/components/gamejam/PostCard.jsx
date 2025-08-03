// src/components/gamejam/PostCard.jsx - Versión mejorada
import React from 'react';
import { User, Calendar, MapPin, Users, Edit3, Trash2, ExternalLink } from 'lucide-react';
// ✅ Importar react-icons
import { FaWhatsapp, FaTelegram, FaDiscord, FaEnvelope, FaPhone } from 'react-icons/fa';
import { SkillTag } from './SkillTag';
import { ToolTag } from './ToolTag';

// Función helper para crear enlaces de itch.io
const createItchLink = (username) => {
  if (!username) return null;
  if (username.includes('http')) return username;
  const cleanUsername = username.replace('.itch.io', '');
  return `https://${cleanUsername}.itch.io`;
};

// Función helper para crear enlaces de contacto
const createContactLink = (type, info) => {
  if (!info) return null;
  
  if (info.includes('http')) return info;
  
  switch(type) {
    case 'whatsapp': {
      const phoneNumber = info.replace(/[^\d+]/g, '');
      return `https://wa.me/${phoneNumber}`;
    }
    case 'telegram':
      if (info.startsWith('@')) {
        return `https://t.me/${info.substring(1)}`;
      }
      return `https://t.me/${info}`;
    case 'discord':
      return null;
    default:
      return null;
  }
};

// ✅ Componente ContactButton mejorado
const ContactButton = ({ contactType, contactInfo }) => {
  const link = createContactLink(contactType, contactInfo);
  
  const getContactIcon = () => {
    switch(contactType) {
      case 'whatsapp': 
        return <FaWhatsapp className="w-4 h-4" />;
      case 'telegram': 
        return <FaTelegram className="w-4 h-4" />;
      case 'discord': 
        return <FaDiscord className="w-4 h-4" />;
      case 'email': 
        return <FaEnvelope className="w-4 h-4" />;
      default: 
        return <FaPhone className="w-4 h-4" />;
    }
  };

  const getContactLabel = () => {
    switch(contactType) {
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'discord': return 'Discord';
      case 'email': return 'Email';
      default: return 'Contactar';
    }
  };

  const getButtonColor = () => {
    switch(contactType) {
      case 'whatsapp': return '#25D366'; // Verde WhatsApp oficial
      case 'telegram': return '#0088cc'; // Azul Telegram oficial
      case 'discord': return '#5865F2'; // Púrpura Discord oficial
      case 'email': return '#EA4335'; // Rojo Gmail
      default: return '#0fc064'; // Verde por defecto
    }
  };

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-white hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: getButtonColor() }}
      >
        {getContactIcon()}
        <span className="text-sm">{getContactLabel()}</span>
        <ExternalLink className="w-3 h-3 opacity-70" />
      </a>
    );
  } else {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white border border-gray-600" 
           style={{ backgroundColor: getButtonColor() }}>
        {getContactIcon()}
        <div className="text-left">
          <div className="text-xs font-semibold">{getContactLabel()}</div>
          <div className="text-xs font-mono opacity-90">{contactInfo}</div>
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

    <div className="mb-6">
      <p className="text-gray-200 leading-relaxed">
        {post.description}
      </p>
    </div>

    {/* ✅ Mejorado: Mejor layout y spacing para la parte inferior */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-700">
      <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{post.timezone}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{post.updatedAt?.toLocaleDateString() || 'Recientemente'}</span>
        </div>
      </div>
      
      {/* ✅ Mejorado: Mejor positioning del botón de contacto */}
      {!isOwner && post.contactInfo && (
        <div className="flex justify-end">
          <ContactButton 
            contactType={post.contactType || 'discord'} 
            contactInfo={post.contactInfo} 
          />
        </div>
      )}
    </div>
  </div>
);
