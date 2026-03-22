import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { compressImage } from '@/lib/image';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/i18n/LanguageContext';

interface InstallationPhotosProps {
  installationId: string;
  isReadOnly?: boolean;
}

export const InstallationPhotos: React.FC<InstallationPhotosProps> = ({ installationId, isReadOnly = false }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { companyId } = useUserRole();
  const { t } = useLanguage();

  // Load photos from DB
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('installations')
        .select('photos')
        .eq('id', installationId)
        .maybeSingle();
      if (!error && data?.photos) {
        setPhotos((data.photos as string[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [installationId]);

  const updatePhotosInDb = async (urls: string[]) => {
    const { error } = await supabase
      .from('installations')
      .update({ photos: urls } as any)
      .eq('id', installationId);
    if (error) throw error;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast({ title: "Error", description: t.installationPhotos.toastErrorImageOnly, variant: "destructive" });
      return;
    }
    if (!companyId) {
      toast({ title: "Error", description: t.installationPhotos.toastErrorNoCompany, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of fileArray) {
        const compressed = await compressImage(file);
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${companyId}/${installationId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from('installation-photos')
          .upload(path, compressed, { upsert: false });
        if (error) throw error;

        const { data } = supabase.storage
          .from('installation-photos')
          .getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      const updated = [...photos, ...newUrls];
      await updatePhotosInDb(updated);
      setPhotos(updated);
      toast({
        title: t.installationPhotos.toastAddedTitle,
        description: t.installationPhotos.toastAddedDesc.replace("{{n}}", String(newUrls.length)),
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({ title: "Error", description: t.installationPhotos.toastErrorUpload, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [photos, companyId, installationId, t]);

  const removePhoto = async (url: string) => {
    try {
      // Extract storage path from public URL
      const match = url.match(/installation-photos\/(.+)$/);
      if (match) {
        await supabase.storage.from('installation-photos').remove([match[1]]);
      }
      const updated = photos.filter(p => p !== url);
      await updatePhotosInDb(updated);
      setPhotos(updated);
      toast({ title: t.installationPhotos.toastRemovedTitle });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({ title: "Error", description: t.installationPhotos.toastErrorRemove, variant: "destructive" });
    }
  };

  const clearAll = async () => {
    try {
      // Remove all from storage
      const paths = photos.map(url => {
        const match = url.match(/installation-photos\/(.+)$/);
        return match ? match[1] : null;
      }).filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabase.storage.from('installation-photos').remove(paths);
      }
      await updatePhotosInDb([]);
      setPhotos([]);
      toast({ title: t.installationPhotos.toastClearedTitle, description: t.installationPhotos.toastClearedDesc });
    } catch (error) {
      console.error('Error clearing photos:', error);
      toast({ title: "Error", description: t.installationPhotos.toastErrorClear, variant: "destructive" });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) { const file = items[i].getAsFile(); if (file) files.push(file); }
    }
    if (files.length > 0) handleFiles(files);
  }, [handleFiles]);

  useEffect(() => {
    if (!isReadOnly) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [handlePaste, isReadOnly]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> {t.installationPhotos.loading}
      </div>
    );
  }

  return (
    <div>
      <Label className="text-sm font-medium">{t.installationPhotos.sectionLabel}</Label>

      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt={t.installationPhotos.photoAlt} className="w-full h-24 object-cover rounded-lg border border-border" />
              {!isReadOnly && (
                <button onClick={() => removePhoto(url)} className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div
          className={`mt-3 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        >
          {photos.length === 0 ? <Camera className="w-6 h-6 mx-auto mb-2 text-muted-foreground" /> : <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />}
          <p className="text-sm text-muted-foreground mb-3">
            {photos.length === 0 ? t.installationPhotos.emptyPrompt : t.installationPhotos.addMorePrompt}
          </p>
          <p className="text-xs text-muted-foreground mb-4">{t.installationPhotos.dragHint}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />{t.installationPhotos.camera}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? t.installationPhotos.uploading : t.installationPhotos.file}
            </Button>
            {photos.length > 0 && (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/50" onClick={clearAll} disabled={uploading}>
                <Trash2 className="w-4 h-4 mr-2" />{t.installationPhotos.clearAll}
              </Button>
            )}
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => { if (e.target.files) handleFiles(e.target.files); }} />
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) handleFiles(e.target.files); }} />
        </div>
      )}
    </div>
  );
};
