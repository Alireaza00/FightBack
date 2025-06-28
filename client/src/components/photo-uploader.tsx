import { useState, useRef } from "react";
import { Camera, Upload, X, Plus, Edit3, Calendar, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type PhotoAttachment } from "@shared/schema";

interface PhotoUploaderProps {
  photos: PhotoAttachment[];
  onPhotosChange: (photos: PhotoAttachment[]) => void;
}

export default function PhotoUploader({ photos, onPhotosChange }: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isImage) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only image files (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: "Please upload images smaller than 10MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoAttachment = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          caption: "",
          timestamp: new Date().toISOString(),
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
        };
        
        onPhotosChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      toast({
        title: "Photos Added",
        description: `Successfully added ${validFiles.length} photo(s)`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  };

  const updateCaption = (photoId: string, caption: string) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId ? { ...photo, caption } : photo
    );
    onPhotosChange(updatedPhotos);
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onPhotosChange(updatedPhotos);
    
    toast({
      title: "Photo Removed",
      description: "Photo has been deleted from this entry",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startCaptionEdit = (photoId: string, currentCaption: string) => {
    setEditingCaption(photoId);
    setCaptionText(currentCaption);
  };

  const saveCaptionEdit = (photoId: string) => {
    updateCaption(photoId, captionText);
    setEditingCaption(null);
    setCaptionText("");
  };

  const cancelCaptionEdit = () => {
    setEditingCaption(null);
    setCaptionText("");
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Upload className="h-8 w-8" />
            <Camera className="h-8 w-8" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Upload Photos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: JPG, PNG, GIF • Max size: 10MB per file
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Attached Photos ({photos.length})
            </h3>
            <span className="text-sm text-gray-500">
              Total: {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || photo.filename}
                        className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Photo Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(photo.timestamp)}</span>
                        </span>
                        <span>{formatFileSize(photo.size)}</span>
                      </div>
                      
                      <div className="text-xs text-gray-400 truncate">
                        {photo.filename}
                      </div>
                    </div>
                    
                    {/* Caption */}
                    <div className="space-y-2">
                      {editingCaption === photo.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Add a caption..."
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveCaptionEdit(photo.id)}
                              className="bg-primary text-white hover:bg-blue-700"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelCaptionEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {photo.caption ? (
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {photo.caption}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                No caption added
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startCaptionEdit(photo.id, photo.caption)}
                            className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-primary"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileImage className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No photos attached</p>
          <p className="text-xs">Upload images to document visual evidence</p>
        </div>
      )}
    </div>
  );
}