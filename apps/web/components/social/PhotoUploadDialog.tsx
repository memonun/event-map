'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Camera, Upload, Loader2, MapPin, Calendar } from 'lucide-react';
import { SocialService } from '@/lib/services/client/social';
import type { EventWithVenue } from '@/lib/types';
import Image from 'next/image';

interface PhotoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  event?: EventWithVenue | null;
}

interface SelectedPhoto {
  file: File;
  preview: string;
}

export function PhotoUploadDialog({ isOpen, onClose, onSuccess, event }: PhotoUploadDialogProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPhotos: SelectedPhoto[] = [];
    const maxFiles = 10;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (let i = 0; i < Math.min(files.length, maxFiles - selectedPhotos.length); i++) {
      const file = files[i];

      if (file.size > maxSize) {
        setError(`"${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported image format. Use JPEG, PNG, or WebP.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      newPhotos.push({ file, preview });
    }

    setSelectedPhotos(prev => [...prev, ...newPhotos]);
    setError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedPhotos.length]);

  const removePhoto = useCallback((index: number) => {
    setSelectedPhotos(prev => {
      const photo = prev[index];
      URL.revokeObjectURL(photo.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) {
      setError('Please select at least one photo to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload photos to storage
      const files = selectedPhotos.map(photo => photo.file);
      const imageUrls = await SocialService.uploadPhotos(files);

      // Create post
      await SocialService.createPost({
        event_id: event?.id,
        caption: caption.trim() || undefined,
        image_urls: imageUrls,
        location: location.trim() || undefined,
        is_public: isPublic,
      });

      // Clean up previews
      selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
      setSelectedPhotos([]);
      setCaption('');
      setLocation('');
      setIsPublic(true);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Clean up previews on component unmount
  React.useEffect(() => {
    return () => {
      selectedPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Share Photos
            {event && (
              <Badge variant="secondary" className="ml-2">
                From Event
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          {event && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{event.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue.name}
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Area */}
          <div className="space-y-4">
            <Label>Photos (max 10)</Label>

            {selectedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={photo.preview}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedPhotos.length < 10 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop photos here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, WebP up to 10MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption for your photos..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 text-right">
              {caption.length}/2000
            </p>
          </div>

          {/* Location Override */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <input
              id="location"
              type="text"
              placeholder="Add a location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="privacy">Make post public</Label>
              <p className="text-sm text-gray-500">
                {isPublic ? 'Everyone can see this post' : 'Only your friends can see this post'}
              </p>
            </div>
            <Switch
              id="privacy"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || selectedPhotos.length === 0}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Share Photos'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}