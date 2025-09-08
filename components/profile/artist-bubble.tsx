'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";

interface ArtistBubbleProps {
  artistName: string;
  artistId?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function ArtistBubble({ 
  artistName, 
  artistId, 
  imageUrl, 
  size = 'md',
  clickable = true 
}: ArtistBubbleProps) {
  const router = useRouter();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': 
        return {
          container: 'h-6',
          avatar: 'w-6 h-6',
          text: 'text-xs px-2',
          icon: 'w-3 h-3'
        };
      case 'md':
        return {
          container: 'h-8',
          avatar: 'w-8 h-8',
          text: 'text-sm px-3',
          icon: 'w-4 h-4'
        };
      case 'lg':
        return {
          container: 'h-10',
          avatar: 'w-10 h-10',
          text: 'text-sm px-4',
          icon: 'w-5 h-5'
        };
      default:
        return {
          container: 'h-8',
          avatar: 'w-8 h-8',
          text: 'text-sm px-3',
          icon: 'w-4 h-4'
        };
    }
  };

  const handleClick = () => {
    if (clickable && artistId) {
      router.push(`/artist/${artistId}`);
    } else if (clickable) {
      // Fallback to search by name
      const searchQuery = encodeURIComponent(artistName);
      router.push(`/search?artist=${searchQuery}`);
    }
  };

  const initials = artistName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = getSizeClasses();

  return (
    <div 
      className={`
        inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full
        ${sizeClasses.container} ${clickable ? 'hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200' : ''}
        group
      `}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* Artist Avatar */}
      <Avatar className={sizeClasses.avatar}>
        <AvatarImage src={imageUrl || undefined} alt={artistName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
          {initials || <Music className={sizeClasses.icon} />}
        </AvatarFallback>
      </Avatar>

      {/* Artist Name */}
      <span className={`
        font-medium text-gray-700 truncate max-w-24 
        ${sizeClasses.text}
        ${clickable ? 'group-hover:text-blue-600' : ''}
      `}>
        {artistName}
      </span>
    </div>
  );
}

// Variant for when you just want the artist name as a badge without avatar
export function ArtistBadge({ 
  artistName, 
  artistId, 
  size = 'md',
  clickable = true 
}: Omit<ArtistBubbleProps, 'imageUrl'>) {
  const router = useRouter();

  const handleClick = () => {
    if (clickable && artistId) {
      router.push(`/artist/${artistId}`);
    } else if (clickable) {
      const searchQuery = encodeURIComponent(artistName);
      router.push(`/search?artist=${searchQuery}`);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'md': return 'text-sm px-3 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-sm px-3 py-1';
    }
  };

  return (
    <Badge 
      variant="secondary"
      className={`
        ${getSizeClass()}
        ${clickable ? 'hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors' : ''}
        bg-gray-100 text-gray-700 border border-gray-200 font-medium
      `}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <Music className="w-3 h-3 mr-1" />
      {artistName}
    </Badge>
  );
}