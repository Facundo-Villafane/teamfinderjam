// src/components/gamejam/PostsGrid.jsx - Versión en Español
import React from 'react';
import { PostCard } from './PostCard';

export const PostsGrid = ({ posts, user, currentJam, onEditPost, onDeletePost }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {posts.map(post => (
      <PostCard 
        key={post.id} 
        post={post} 
        isOwner={user && post.userId === user.uid}
        onEdit={onEditPost}
        onDelete={onDeletePost}
      />
    ))}
    {posts.length === 0 && (
      <div className="col-span-2 text-center text-gray-400 py-12">
        <p className="text-xl">Aún no hay publicaciones para {currentJam?.name || 'esta jam'}</p>
        <p>¡Sé el primero en crear una!</p>
      </div>
    )}
  </div>
);