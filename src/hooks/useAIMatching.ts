import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AttendeeProfile {
  id: string;
  name?: string;
  role?: string;
  company?: string;
  bio?: string;
  niche?: string;
  networking_preferences?: string[];
  tags?: string[];
}

interface MatchedProfile extends AttendeeProfile {
  matchScore: number;
  matchReasons: string[];
}

export const useAIMatching = (profiles: AttendeeProfile[], currentUserProfile?: AttendeeProfile) => {
  const { currentUser } = useAuth();
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(false);

  // Calculate similarity score between two profiles
  const calculateMatchScore = (profile1: AttendeeProfile, profile2: AttendeeProfile): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // Niche similarity (30% weight)
    if (profile1.niche && profile2.niche && profile1.niche === profile2.niche) {
      score += 30;
      reasons.push(`Both work in ${profile1.niche}`);
    }

    // Networking preferences overlap (25% weight)
    if (profile1.networking_preferences && profile2.networking_preferences) {
      const commonPrefs = profile1.networking_preferences.filter(pref => 
        profile2.networking_preferences?.includes(pref)
      );
      if (commonPrefs.length > 0) {
        const prefScore = Math.min(25, (commonPrefs.length / Math.max(profile1.networking_preferences.length, profile2.networking_preferences.length)) * 25);
        score += prefScore;
        reasons.push(`${commonPrefs.length} common networking interest${commonPrefs.length > 1 ? 's' : ''}`);
      }
    }

    // Tags/interests overlap (25% weight)
    if (profile1.tags && profile2.tags) {
      const commonTags = profile1.tags.filter(tag => profile2.tags?.includes(tag));
      if (commonTags.length > 0) {
        const tagScore = Math.min(25, (commonTags.length / Math.max(profile1.tags.length, profile2.tags.length)) * 25);
        score += tagScore;
        reasons.push(`${commonTags.length} shared interest${commonTags.length > 1 ? 's' : ''}`);
      }
    }

    // Role compatibility (20% weight)
    if (profile1.role && profile2.role) {
      const complementaryRoles = [
        ['entrepreneur', 'investor'],
        ['designer', 'developer'],
        ['marketer', 'founder'],
        ['consultant', 'manager'],
        ['student', 'mentor']
      ];
      
      const isComplementary = complementaryRoles.some(pair => 
        (profile1.role.toLowerCase().includes(pair[0]) && profile2.role.toLowerCase().includes(pair[1])) ||
        (profile1.role.toLowerCase().includes(pair[1]) && profile2.role.toLowerCase().includes(pair[0]))
      );
      
      if (isComplementary) {
        score += 20;
        reasons.push('Complementary professional roles');
      } else if (profile1.role.toLowerCase() === profile2.role.toLowerCase()) {
        score += 10;
        reasons.push('Similar professional roles');
      }
    }

    return { score: Math.round(score), reasons };
  };

  // Get AI-matched profiles based on current user's profile
  const aiMatchedProfiles = useMemo(() => {
    if (!aiMatchingEnabled || !currentUserProfile) return [];

    const matchedProfiles: MatchedProfile[] = profiles
      .filter(profile => profile.id !== currentUser?.id)
      .map(profile => {
        const matchResult = calculateMatchScore(currentUserProfile, profile);
        return {
          ...profile,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons
        };
      })
      .filter(profile => profile.matchScore > 20) // Only show profiles with >20% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches

    return matchedProfiles;
  }, [profiles, currentUserProfile, aiMatchingEnabled, currentUser?.id]);

  const toggleAIMatching = () => {
    setAiMatchingEnabled(!aiMatchingEnabled);
  };

  return {
    aiMatchingEnabled,
    toggleAIMatching,
    aiMatchedProfiles,
  };
};