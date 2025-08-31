
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Sparkles } from 'lucide-react';

interface NetworkingFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedNiches: string[];
  onNicheChange: (niches: string[]) => void;
  selectedNetworkingPrefs: string[];
  onNetworkingPrefChange: (prefs: string[]) => void;
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  showSuggestedOnly: boolean;
  onSuggestedToggle: (show: boolean) => void;
  availableNiches: string[];
  availableNetworkingPrefs: string[];
  availableTags: string[];
  onClearFilters: () => void;
}

export const NetworkingFilter: React.FC<NetworkingFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedNiches,
  onNicheChange,
  selectedNetworkingPrefs,
  onNetworkingPrefChange,
  selectedTags,
  onTagChange,
  showSuggestedOnly,
  onSuggestedToggle,
  availableNiches,
  availableNetworkingPrefs,
  availableTags,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedNiches.length > 0 || selectedNetworkingPrefs.length > 0 || selectedTags.length > 0 || showSuggestedOnly;

  const handleNicheToggle = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      onNicheChange(selectedNiches.filter(n => n !== niche));
    } else {
      onNicheChange([...selectedNiches, niche]);
    }
  };

  const handleNetworkingPrefToggle = (pref: string) => {
    if (selectedNetworkingPrefs.includes(pref)) {
      onNetworkingPrefChange(selectedNetworkingPrefs.filter(p => p !== pref));
    } else {
      onNetworkingPrefChange([...selectedNetworkingPrefs, pref]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search by name, role, company, or skills..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={showSuggestedOnly ? "default" : "outline"}
          onClick={() => onSuggestedToggle(!showSuggestedOnly)}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} />
          <span>Suggest</span>
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filters</span>
              {hasActiveFilters && (
                 <span className="bg-connect-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                   {selectedNiches.length + selectedNetworkingPrefs.length + selectedTags.length + (showSuggestedOnly ? 1 : 0)}
                 </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Filter Options</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-auto p-1">
                    <X size={16} />
                    <span className="sr-only">Clear filters</span>
                  </Button>
                )}
              </div>

              {/* Professional Niches */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Professional Niches</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {availableNiches.map((niche) => (
                    <div key={niche} className="flex items-center space-x-2">
                      <Checkbox
                        id={`niche-${niche}`}
                        checked={selectedNiches.includes(niche)}
                        onCheckedChange={() => handleNicheToggle(niche)}
                      />
                      <Label
                        htmlFor={`niche-${niche}`}
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        {niche}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Networking Preferences */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Looking to Connect With</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {availableNetworkingPrefs.map((pref) => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pref-${pref}`}
                        checked={selectedNetworkingPrefs.includes(pref)}
                        onCheckedChange={() => handleNetworkingPrefToggle(pref)}
                      />
                      <Label
                        htmlFor={`pref-${pref}`}
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        {pref}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills & Interests</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label
                        htmlFor={`tag-${tag}`}
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};
