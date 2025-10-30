/**
 * Utility functions for avatar handling
 */

// List of available placeholder avatars
// Add more as you place images in public/assets/avatars/
const PLACEHOLDER_AVATARS = [
  '/assets/avatars/avatar-1.svg',
  '/assets/avatars/avatar-2.svg',
  '/assets/avatars/avatar-3.svg',
  '/assets/avatars/avatar-4.svg',
  '/assets/avatars/avatar-5.svg',
  '/assets/avatars/avatar-6.svg',
  '/assets/avatars/avatar-7.svg',
  '/assets/avatars/avatar-8.svg',
];

/**
 * Get a random placeholder avatar URL
 * Uses a seed (like user ID) to ensure the same user always gets the same random avatar
 * @param {string} seed - A unique identifier (like user ID or username)
 * @returns {string} Path to a placeholder avatar image
 */
export const getPlaceholderAvatar = (seed) => {
  if (!seed) {
    // If no seed provided, use truly random
    const randomIndex = Math.floor(Math.random() * PLACEHOLDER_AVATARS.length);
    return PLACEHOLDER_AVATARS[randomIndex];
  }

  // Convert seed to a number using simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % PLACEHOLDER_AVATARS.length;
  return PLACEHOLDER_AVATARS[index];
};

/**
 * Get user's avatar URL or placeholder
 * @param {object} user - User object with profile.avatar
 * @returns {string} Avatar URL (either custom or placeholder)
 */
export const getUserAvatar = (user) => {
  if (user?.profile?.avatar) {
    return user.profile.avatar;
  }
  
  // Use user ID or username as seed for consistent placeholder
  const seed = user?._id || user?.id || user?.username || '';
  return getPlaceholderAvatar(seed);
};

/**
 * Check if the avatar is a placeholder (not a custom upload)
 * @param {string} avatarUrl - Avatar URL to check
 * @returns {boolean} True if it's a placeholder avatar
 */
export const isPlaceholderAvatar = (avatarUrl) => {
  return avatarUrl && avatarUrl.startsWith('/assets/avatars/');
};

export default {
  getPlaceholderAvatar,
  getUserAvatar,
  isPlaceholderAvatar,
  PLACEHOLDER_AVATARS
};
