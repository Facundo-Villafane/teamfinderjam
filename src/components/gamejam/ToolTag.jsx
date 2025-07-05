// src/components/gamejam/ToolTag.jsx - Nuevo componente con iconos
import React from 'react';
import { 
  SiUnity, 
  SiUnrealengine, 
  SiGodotengine,
  SiBlender,
  SiAdobe,
  SiAudacity
} from 'react-icons/si';
import { 
  FaGamepad, 
  FaTools, 
  FaImage, 
  FaMusic, 
  FaCode, 
  FaCube 
} from 'react-icons/fa';

// Mapeo de herramientas a iconos
const toolIcons = {
  'Unity': SiUnity,
  'Unreal Engine': SiUnrealengine,
  'Godot': SiGodotengine,
  'GameMaker': FaGamepad,
  'Construct': FaTools,
  'Phaser': FaCode,
  'Blender': SiBlender,
  'Maya': FaCube,
  'Photoshop': SiAdobe,
  'Aseprite': FaImage,
  'FL Studio': FaMusic,
  'Audacity': SiAudacity
};

export const ToolTag = ({ tool, active = false }) => {
  const IconComponent = toolIcons[tool] || FaTools;

  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-700 text-gray-300'
      }`}
    >
      <IconComponent className="w-3 h-3" />
      {tool}
    </span>
  );
};