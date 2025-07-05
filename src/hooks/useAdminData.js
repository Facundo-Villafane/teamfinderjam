// src/hooks/useAdminData.js
import { useState, useEffect } from 'react';
import {
  getAllJams,
  getAllPosts,
  getAdminStats,
  createJam,
  updateJam,
  deleteJam,
  setActiveJam,
  deletePostAsAdmin,
  togglePostFeatured,
  togglePostFlagged,
  logAdminAction
} from '../firebase/admin';

export const useAdminData = (user) => {
  const [jams, setJams] = useState([]);
  const [stats, setStats] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [jamsData, postsData, statsData] = await Promise.all([
        getAllJams(),
        getAllPosts(),
        getAdminStats()
      ]);
      
      setJams(jamsData);
      setPosts(postsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    jams,
    stats,
    posts,
    loading,
    loadAllData
  };
};