// src/components/gamejam/PostsGrid.jsx - Actualizado para mostrar info de la jam
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
      <div className="col-span-2 text-center text-orange-200 py-12">
        <p className="text-xl">No posts yet for {currentJam?.name || 'this jam'}</p>
        <p>Be the first to create one!</p>
      </div>
    )}
  </div>
);