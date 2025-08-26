
import { useState, useMemo } from 'react';

interface AttendeeProfile {
  id: string;
  name?: string;
  role?: string;
  company?: string;
  bio?: string;
  niche?: string;
  photo_url?: string;
  networking_preferences?: string[];
  tags?: string[];
  twitter_link?: string;
  linkedin_link?: string;
  github_link?: string;
  instagram_link?: string;
  website_link?: string;
  created_at?: string;
}

export const useNetworkingFilters = (profiles: AttendeeProfile[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedNetworkingPrefs, setSelectedNetworkingPrefs] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  // Extract unique values for filter options
  const availableNiches = useMemo(() => {
    const niches = profiles
      .map(p => p.niche)
      .filter(Boolean)
      .filter((niche, index, array) => array.indexOf(niche) === index)
      .sort();
    return niches as string[];
  }, [profiles]);

  const availableNetworkingPrefs = useMemo(() => {
    const prefs = profiles
      .flatMap(p => p.networking_preferences || [])
      .filter((pref, index, array) => array.indexOf(pref) === index)
      .sort();
    return prefs;
  }, [profiles]);

  const availableTags = useMemo(() => {
    const tags = profiles
      .flatMap(p => p.tags || [])
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();
    return tags;
  }, [profiles]);

  // Check if profile is incomplete
  const isProfileIncomplete = (profile: AttendeeProfile) => {
    return !profile.bio || 
           !profile.niche || 
           !profile.networking_preferences?.length || 
           !profile.tags?.length ||
           !profile.company ||
           !profile.role;
  };

  // Filter profiles based on current filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Niche filter
      const matchesNiche = selectedNiches.length === 0 || 
        (profile.niche && selectedNiches.includes(profile.niche));

      // Networking preferences filter
      const matchesNetworkingPref = selectedNetworkingPrefs.length === 0 ||
        profile.networking_preferences?.some(pref => selectedNetworkingPrefs.includes(pref));

      // Tags filter
      const matchesTags = selectedTags.length === 0 ||
        profile.tags?.some(tag => selectedTags.includes(tag));

      // Incomplete profile filter
      const matchesIncompleteFilter = !showIncompleteOnly || isProfileIncomplete(profile);

      return matchesSearch && matchesNiche && matchesNetworkingPref && matchesTags && matchesIncompleteFilter;
    });
  }, [profiles, searchTerm, selectedNiches, selectedNetworkingPrefs, selectedTags, showIncompleteOnly]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedNiches([]);
    setSelectedNetworkingPrefs([]);
    setSelectedTags([]);
    setShowIncompleteOnly(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedNiches,
    setSelectedNiches,
    selectedNetworkingPrefs,
    setSelectedNetworkingPrefs,
    selectedTags,
    setSelectedTags,
    showIncompleteOnly,
    setShowIncompleteOnly,
    availableNiches,
    availableNetworkingPrefs,
    availableTags,
    filteredProfiles,
    clearAllFilters,
    isProfileIncomplete,
  };
};
