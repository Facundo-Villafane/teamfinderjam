import { useState, useEffect } from 'react';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getPostsByEdition, 
  getUserPostByEdition 
} from '../firebase/firestore';

export const usePosts = (user, currentEdition) => {
  const [posts, setPosts] = useState([]);
  const [userPost, setUserPost] = useState(null);

  const loadPosts = async () => {
    // ✅ VALIDAR que currentEdition no sea undefined
    if (!currentEdition) {
      console.log('No edition selected yet, skipping posts load');
      setPosts([]);
      return;
    }

    try {
      const editionPosts = await getPostsByEdition(currentEdition);
      setPosts(editionPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      if (error.code !== 'permission-denied' && error.code !== 'unavailable') {
        alert('Error loading posts. Please try again.');
      }
      setPosts([]);
    }
  };

  const loadUserPost = async (userId) => {
    // ✅ VALIDAR que currentEdition no sea undefined
    if (!userId || !currentEdition) {
      console.log('No user or edition, skipping user post load');
      setUserPost(null);
      return;
    }

    try {
      const currentEditionPost = await getUserPostByEdition(userId, currentEdition);
      setUserPost(currentEditionPost);
    } catch (error) {
      console.error('Error loading user post:', error);
      setUserPost(null);
    }
  };

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserPost(user.uid);
    }
  }, [currentEdition, user]); // ✅ Solo se ejecuta cuando currentEdition cambia

  const handleSavePost = async (postData, isEditing, editingPost) => {
    if (!user || !postData.username || !postData.description || !currentEdition) {
      alert('Please fill in username and description');
      return false;
    }

    try {
      const post = {
        ...postData,
        userId: user.uid,
        userEmail: user.email,
        username: postData.username,
        teamMembers: postData.teamMembers.split(',').map(m => m.trim()).filter(m => m),
        edition: currentEdition // ✅ Usar currentEdition validado
      };

      if (isEditing) {
        await updatePost(editingPost.id, post);
      } else {
        await createPost(post);
      }

      await loadPosts();
      await loadUserPost(user.uid);
      alert(isEditing ? 'Post updated successfully!' : 'Post created successfully!');
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. Please try again.');
      return false;
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu post?')) return;

    try {
      await deletePost(postId);
      await loadPosts();
      await loadUserPost(user.uid);
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  return { posts, userPost, handleSavePost, handleDeletePost };
};