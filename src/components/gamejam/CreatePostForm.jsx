// src/components/gamejam/CreatePostForm.jsx - Con contacto e itch.io
import React from 'react';
import { SkillSelector } from './SkillSelector';
import { ToolSelector } from './ToolSelector';

export const CreatePostForm = ({
  currentPost,
  isEditing,
  onFieldChange,
  onSkillToggle,
  onToolToggle,
  onSubmit,
  onCancel,
  submitting,
  skillOptions,
  toolOptions,
  timezoneOptions
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? 'Editar Publicación' : 'Crear Nueva Publicación'}
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">
            Escribe un resumen breve de lo que estás buscando:
          </label>
          <textarea
            value={currentPost.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none border border-gray-600 focus:border-gray-500 focus:outline-none"
            placeholder="Describe tu proyecto y qué tipo de miembros de equipo estás buscando..."
            maxLength={2000}
            required
          />
          <p className="text-gray-400 text-sm mt-1">
            {2000 - currentPost.description.length} caracteres restantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">
              Usuario principal de itch.io:
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentPost.username}
                onChange={(e) => onFieldChange('username', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none pr-20"
                placeholder="tunombre"
                required
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">.itch.io</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">Solo el nombre de usuario, automáticamente se enlazará a tu perfil</p>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Otros miembros del equipo (itch.io):
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentPost.teamMembers}
                onChange={(e) => onFieldChange('teamMembers', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none pr-20"
                placeholder="usuario1, usuario2"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">.itch.io</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">Separar con comas, cada uno será enlazado automáticamente</p>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Contacto (WhatsApp o Discord):
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                value={currentPost.contactType || 'discord'}
                onChange={(e) => onFieldChange('contactType', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none mb-2"
              >
                <option value="discord">Discord</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                value={currentPost.contactInfo || ''}
                onChange={(e) => onFieldChange('contactInfo', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
                placeholder={
                  currentPost.contactType === 'discord' ? 'usuario#1234 o enlace de servidor' :
                  currentPost.contactType === 'whatsapp' ? '+54911234567 o enlace' :
                  currentPost.contactType === 'telegram' ? '@usuario o enlace' :
                  'Usuario o enlace'
                }
                required
              />
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {currentPost.contactType === 'discord' && 'Ej: miusuario#1234 o https://discord.gg/enlace'}
            {currentPost.contactType === 'whatsapp' && 'Ej: +54911234567 o https://wa.me/54911234567'}
            {currentPost.contactType === 'telegram' && 'Ej: @miusuario o https://t.me/miusuario'}
            {(!currentPost.contactType || currentPost.contactType === 'otro') && 'Cualquier forma de contacto'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkillSelector
            title="¿Qué habilidades tienes?"
            skills={skillOptions}
            selectedSkills={currentPost.canDo}
            onToggleSkill={(skill) => onSkillToggle(skill, 'canDo')}
          />

          <SkillSelector
            title="¿Qué habilidades estás buscando?"
            skills={skillOptions}
            selectedSkills={currentPost.lookingFor}
            onToggleSkill={(skill) => onSkillToggle(skill, 'lookingFor')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-3 font-semibold">¿En qué zona horaria trabajas?</label>
            <select
              value={currentPost.timezone}
              onChange={(e) => onFieldChange('timezone', e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
            >
              {timezoneOptions.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-3 font-semibold">¿Cuántas personas hay en tu equipo/grupo?</label>
            <select
              value={currentPost.memberCount}
              onChange={(e) => onFieldChange('memberCount', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <ToolSelector
          title="¿Con qué herramientas quieres trabajar?"
          tools={toolOptions}
          selectedTools={currentPost.tools}
          onToggleTool={onToolToggle}
          activeColor="bg-purple-600"
        />

        <div className="flex justify-center gap-4">
          {isEditing && (
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90"
            style={{ backgroundColor: '#0fc064' }}
          >
            {submitting 
              ? 'Guardando...' 
              : isEditing 
                ? 'Actualizar Publicación' 
                : 'Crear Publicación'
            }
          </button>
        </div>
      </div>
    </div>
  );
};