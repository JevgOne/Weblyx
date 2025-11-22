"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, Loader2 } from "lucide-react";

interface MediaFile {
  url: string;
  name: string;
  alt?: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/media/list");
      const result = await response.json();

      if (result.success) {
        setFiles(result.data || []);
      }
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
      setSelectedUrl("");
      setSearchTerm("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Vybrat obrázek z knihovny</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat podle názvu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Gallery */}
          <div className="h-[400px] rounded-md border p-4 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {searchTerm ? "Žádné obrázky nenalezeny" : "Žádné obrázky v knihovně"}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <button
                    key={file.url}
                    onClick={() => setSelectedUrl(file.url)}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedUrl === file.url
                        ? "border-primary ring-2 ring-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={file.url}
                        alt={file.alt || file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedUrl === file.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-2">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedUrl("");
                setSearchTerm("");
              }}
            >
              Zrušit
            </Button>
            <Button onClick={handleSelect} disabled={!selectedUrl}>
              Vybrat obrázek
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
