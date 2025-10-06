import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Play, 
  Trash2, 
  Search, 
  Filter,
  RefreshCw,
  FileVideo,
  Image as ImageIcon,
  Clock,
  HardDrive,
  Eye,
  X
} from 'lucide-react';
import apiService from '../services/api';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType !== 'all') params.type = filterType;
      
      const response = await apiService.getMedia(params);
      setMedia(response.media || response);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [searchTerm, filterType]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extensão
        await apiService.uploadMedia(file, name);
      }
      
      await loadMedia();
      setUploadDialogOpen(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaItem) => {
    if (!confirm(`Tem certeza que deseja remover "${mediaItem.name}"?`)) {
      return;
    }
    
    try {
      await apiService.deleteMedia(mediaItem._id);
      await loadMedia();
    } catch (error) {
      console.error('Erro ao remover mídia:', error);
      setError(error.message);
    }
  };

  const openPreview = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setPreviewDialogOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (mimetype) => {
    if (mimetype.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-blue-500" />;
    }
    if (mimetype.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    }
    return <FileVideo className="h-5 w-5 text-gray-500" />;
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      (filterType === 'video' && item.mimetype.startsWith('video/')) ||
      (filterType === 'image' && item.mimetype.startsWith('image/'));
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h2>
          <p className="text-gray-600">Gerencie vídeos e imagens para exibição nas TVs</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={loadMedia} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload de Mídia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Mídia</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Selecionar Arquivos</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="video/*,image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploading}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos suportados: MP4, WebM, AVI, MOV, JPG, PNG, GIF, WebP
                  </p>
                </div>
                
                {uploading && (
                  <div className="text-center py-4">
                    <div className="animate-spin mx-auto mb-2">
                      <RefreshCw className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600">Enviando arquivos...</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os tipos</option>
            <option value="video">Apenas vídeos</option>
            <option value="image">Apenas imagens</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {media.length === 0 ? 'Nenhuma mídia encontrada' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {media.length === 0 
                ? 'Faça upload de vídeos e imagens para começar a criar playlists'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
            {media.length === 0 && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Primeiro Upload
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {item.mimetype.startsWith('video/') ? (
                  <video
                    src={apiService.getStreamUrl(item.filename)}
                    className="w-full h-full object-cover"
                    muted
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  />
                ) : (
                  <img
                    src={apiService.getStreamUrl(item.filename)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openPreview(item)}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 truncate flex-1" title={item.name}>
                      {item.name}
                    </h3>
                    {getMediaIcon(item.mimetype)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(item.duration)}
                    </div>
                    <div className="flex items-center">
                      <HardDrive className="h-3 w-3 mr-1" />
                      {formatFileSize(item.size)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.mimetype.split('/')[0]}
                    </Badge>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPreview(item)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedMedia?.name}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedMedia.mimetype.startsWith('video/') ? (
                  <video
                    src={apiService.getStreamUrl(selectedMedia.filename)}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <img
                    src={apiService.getStreamUrl(selectedMedia.filename)}
                    alt={selectedMedia.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Nome do Arquivo</Label>
                  <p className="text-gray-600">{selectedMedia.originalName}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Tipo</Label>
                  <p className="text-gray-600">{selectedMedia.mimetype}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Tamanho</Label>
                  <p className="text-gray-600">{formatFileSize(selectedMedia.size)}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Duração</Label>
                  <p className="text-gray-600">{formatDuration(selectedMedia.duration)}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Upload</Label>
                  <p className="text-gray-600">
                    {new Date(selectedMedia.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <Label className="font-medium">URL de Streaming</Label>
                  <p className="text-gray-600 text-xs break-all">
                    {apiService.getStreamUrl(selectedMedia.filename)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Media;
