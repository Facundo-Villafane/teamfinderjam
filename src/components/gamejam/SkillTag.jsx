// src/components/gamejam/SkillTag.jsx - Con iconos
import React from 'react';
import { 
  FaPaintBrush, 
  FaCube, 
  FaCode, 
  FaCog, 
  FaMusic, 
  FaVolumeUp, 
  FaCrown, 
  FaBug, 
  FaQuestion, 
  FaHeart, 
  FaMicrophone 
} from 'react-icons/fa';

// Mapeo de skills a iconos
const skillIcons = {
  'Arte 2D': FaPaintBrush,
  '2D Art': FaPaintBrush,
  'Arte 3D': FaCube,
  '3D Art': FaCube,
  'Programación': FaCode,
  'Code': FaCode,
  'Diseño y Producción': FaCog,
  'Design & Production': FaCog,
  'Música': FaMusic,
  'Music': FaMusic,
  'Efectos de Sonido': FaVolumeUp,
  'SFX': FaVolumeUp,
  'Líder de Equipo': FaCrown,
  'Team Lead': FaCrown,
  'Testing y Soporte': FaBug,
  'Testing & Support': FaBug,
  'Otro': FaQuestion,
  'Other': FaQuestion,
  'Vibes': FaHeart,
  'Actuación de Voz': FaMicrophone,
  'Voice Acting': FaMicrophone
};

export const SkillTag = ({ skill, active = false }) => {
  const IconComponent = skillIcons[skill] || FaQuestion;

  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
        active 
          ? 'text-white' 
          : 'bg-gray-700 text-gray-300'
      }`}
      style={active ? { backgroundColor: '#0fc064' } : {}}
    >
      <IconComponent className="w-3 h-3" />
      {skill}
    </span>
  );
};