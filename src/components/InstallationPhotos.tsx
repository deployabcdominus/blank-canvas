import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { compressImage, loadImage } from '@/lib/image';

interface Photo {
  id: string;
  url: string;
  file: File;
  timestamp: Date;
}

interface InstallationPhotosProps {
  installationId: string;
  isReadOnly?: boolean;
}

export const InstallationPhotos: React.FC<InstallationPhotosProps> = ({ installationId, isReadOnly = false }) => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const stored = localStorage.getItem(`installation-photos-${installationId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const savePhotos = useCallback((updatedPhotos: Photo[]) => {
    localStorage.setItem(`installation-photos-${installationId}`, JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
  }, [installationId]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({ title: "Error", description: "Por favor, seleccione solo archivos de imagen.", variant: "destructive" });
      return;
    }
    try {
      const newPhotos: Photo[] = [];
      for (const file of imageFiles) {
        const compressedFile = await compressImage(file);
        const url = URL.createObjectURL(compressedFile);
        newPhotos.push({ id: `${Date.now()}-${Math.random()}`, url, file: compressedFile, timestamp: new Date() });
      }
      const updatedPhotos = [...photos, ...newPhotos];
      savePhotos(updatedPhotos);
      toast({ title: "Fotos agregadas", description: `${newPhotos.length} foto(s) agregada(s) con éxito.` });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error processing images:', error);
      toast({ title: "Error", description: "Error al procesar las imágenes.", variant: "destructive" });
    }
  }, [photos, savePhotos]);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) { const file = items[i].getAsFile(); if (file) files.push(file); }
    }
    if (files.length > 0) handleFiles(files);
  }, [handleFiles]);

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => { if (photo.id === photoId) { URL.revokeObjectURL(photo.url); return false; } return true; });
    savePhotos(updatedPhotos);
    toast({ title: "Foto eliminada", description: "Foto eliminada con éxito." });
  };

  React.useEffect(() => {
    if (!isReadOnly) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [handlePaste, isReadOnly]);

  return (
    <div>
      <Label className="text-sm font-medium">Fotos de Instalación</Label>
      
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img src={photo.url} alt="Foto de instalación" className="w-full h-24 object-cover rounded-lg border border-white/20" />
              {!isReadOnly && (
                <button onClick={() => removePhoto(photo.id)} className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                {photo.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div className={`mt-3 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-white/30'}`}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          {photos.length === 0 ? <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" /> : <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />}
          <p className="text-sm text-muted-foreground mb-3">{photos.length === 0 ? "Agregue fotos de la instalación" : "Agregar más fotos"}</p>
          <p className="text-xs text-muted-foreground mb-4">Arrastre y suelte, pegue (Ctrl+V) o haga clic en los botones de abajo</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" className="btn-glass" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" />Cámara
            </Button>
            <Button variant="outline" size="sm" className="btn-glass" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />Archivo
            </Button>
            {photos.length > 0 && (
              <Button variant="outline" size="sm" className="btn-glass text-destructive border-destructive/50"
                onClick={() => { photos.forEach(photo => URL.revokeObjectURL(photo.url)); savePhotos([]); toast({ title: "Fotos eliminadas", description: "Todas las fotos fueron eliminadas." }); }}>
                <Trash2 className="w-4 h-4 mr-2" />Limpiar Todo
              </Button>
            )}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleCameraCapture} />
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>
      )}
    </div>
  );
};