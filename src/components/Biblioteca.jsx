import React, { useState, useEffect } from 'react';
import { Upload, Play, Trash2, FileVideo, HardDrive, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import ApiService from '../services/api';
import './Biblioteca.css';

const Biblioteca = () => {
  const [medias, setMedias] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaName, setMediaName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalFileSize: 0,
    totalDuration: 0
  });

  useEffect(() => {
    loadMedias();
  }, []);

  const loadMedias = async () => {
    try {
      setLoading(true);
      const mediasData = await ApiService.getMedias();
      setMedias(mediasData);
      
      // Calcular estatísticas
      const totalFileSize = mediasData.reduce((total, media) => total + (media.fileSize || 0), 0);
      const totalDuration = mediasData.reduce((total, media) => total + (media.durationSec || 0), 0);
      
      setStats({
        totalMedia: mediasData.length,
        totalFileSize,
        totalDuration
      });
      
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
      setError('Erro ao carregar mídias. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Usar o nome do arquivo como nome padrão da mídia
      setMediaName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !mediaName.trim()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('name', mediaName);

      await ApiService.uploadMedia(formData);
      
      // Recarregar mídias após upload
      await loadMedias();
      
      // Limpar formulário
      setSelectedFile(null);
      setMediaName('');
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError('Erro ao fazer upload da mídia.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return;

    try {
      await ApiService.deleteMedia(mediaId);
      setMedias(medias.filter(media => media._id !== mediaId));
      
      // Recalcular estatísticas
      const updatedMedias = medias.filter(media => media._id !== mediaId);
      const totalFileSize = updatedMedias.reduce((total, media) => total + (media.fileSize || 0), 0);
      const totalDuration = updatedMedias.reduce((total, media) => total + (media.durationSec || 0), 0);
      
      setStats({
        totalMedia: updatedMedias.length,
        totalFileSize,
        totalDuration
      });
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      setError('Erro ao excluir mídia.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadMedias}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Biblioteca de Mídias</h1>
          <p className="text-muted-foreground">
            Gerencie seus vídeos e conteúdos audiovisuais
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload de Mídia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Nova Mídia</DialogTitle>
              <DialogDescription>
                Adicione um novo vídeo à sua biblioteca de conteúdos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="mediaFile">Arquivo de Vídeo</Label>
                <Input
                  id="mediaFile"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="mediaName">Nome da Mídia</Label>
                <Input
                  id="mediaName"
                  value={mediaName}
                  onChange={(e) => setMediaName(e.target.value)}
                  placeholder="Ex: Vídeo Promocional 2024"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !mediaName.trim() || uploading}
              >
                {uploading ? 'Enviando...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mídias</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
            <p className="text-xs text-muted-foreground">
              Vídeos na biblioteca
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalFileSize)}</div>
            <p className="text-xs text-muted-foreground">
              Armazenamento total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Tempo de conteúdo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medias.map((media) => (
          <Card key={media._id} className="media-card">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <CardTitle className="text-lg">{media.name}</CardTitle>
                <CardDescription>{media.filename}</CardDescription>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Duração: {formatDuration(media.durationSec || 0)}</span>
                <span>{formatFileSize(media.fileSize || 0)}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Criado em: {new Date(media.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-1" />
                  Visualização
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteMedia(media._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {medias.length === 0 && (
        <div className="text-center py-12">
          <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma mídia encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece fazendo upload do seu primeiro vídeo
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload de Mídia
          </Button>
        </div>
      )}
    </div>
  );
};

export default Biblioteca;

