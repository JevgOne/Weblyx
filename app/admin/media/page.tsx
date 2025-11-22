"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Trash2, Copy, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import imageCompression from "browser-image-compression";

interface MediaFile {
  url: string;
  path: string;
  name: string;
  alt?: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");
  const [generatingAlt, setGeneratingAlt] = useState<string | null>(null);

  // Load media files
  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      const mediaRef = ref(storage, "media");
      const result = await listAll(mediaRef);

      const filePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          url,
          path: itemRef.fullPath,
          name: itemRef.name,
        };
      });

      const mediaFiles = await Promise.all(filePromises);
      setFiles(mediaFiles);
    } catch (err) {
      console.error("Error loading media:", err);
      setError("Chyba při načítání médií");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMediaFiles();
  }, []);

  // Upload files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        const timestamp = Date.now();
        const fileName = `media/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);

        // Auto-generate ALT text
        const altResponse = await fetch("/api/media/generate-alt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: downloadURL, fileName: file.name }),
        });

        const altResult = await altResponse.json();
        const alt = altResult.success ? altResult.data.alt : "";

        return {
          url: downloadURL,
          path: fileName,
          name: file.name,
          alt,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles([...uploadedFiles, ...files]);
      setSuccess(`✅ Nahráno ${uploadedFiles.length} souborů (s AI ALT texty)`);
      e.target.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Chyba při nahrávání");
    } finally {
      setUploading(false);
    }
  };

  // Delete file
  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Smazat ${file.name}?`)) return;

    try {
      const fileRef = ref(storage, file.path);
      await deleteObject(fileRef);
      setFiles(files.filter((f) => f.path !== file.path));
      setSuccess("✅ Smazáno");
    } catch (err) {
      setError("Chyba při mazání");
    }
  };

  // Copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(""), 2000);
  };

  // Generate ALT for existing image
  const handleGenerateAlt = async (file: MediaFile) => {
    setGeneratingAlt(file.path);
    try {
      const response = await fetch("/api/media/generate-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file.url, fileName: file.name }),
      });

      const result = await response.json();
      if (result.success) {
        setFiles(files.map((f) =>
          f.path === file.path ? { ...f, alt: result.data.alt } : f
        ));
        setSuccess("✅ ALT text vygenerován");
      }
    } catch (err) {
      setError("Chyba při generování ALT");
    } finally {
      setGeneratingAlt(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📸 Knihovna médií</h1>
        <p className="text-muted-foreground">
          Nahraj obrázky hromadně, AI vygeneruje ALT texty automaticky
        </p>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Nahrát obrázky</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Nahrávám..." : "Nahrát"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            💡 Vyberte více souborů najednou. AI automaticky vygeneruje ALT texty.
          </p>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Galerie ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Načítám...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Žádné obrázky</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {files.map((file) => (
                <div key={file.path} className="border rounded-lg p-4 space-y-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 rounded overflow-hidden bg-muted shrink-0">
                      <img
                        src={file.url}
                        alt={file.alt || file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{file.url}</p>
                      </div>

                      {/* ALT Text */}
                      <div>
                        <label className="text-sm font-medium">ALT text:</label>
                        {file.alt ? (
                          <p className="text-sm text-muted-foreground mt-1">{file.alt}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 mt-1 italic">Žádný ALT text</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(file.url)}
                        >
                          {copiedUrl === file.url ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Zkopírováno
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Kopírovat URL
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateAlt(file)}
                          disabled={generatingAlt === file.path}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {generatingAlt === file.path ? "Generuji..." : "AI ALT"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Smazat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
