import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  PlayCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  FileVideo,
  RefreshCw,
  GripVertical,
  X,
  Play
} from 'lucide-react';
import apiService from '../services/api';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    media: []
  });
  const [availableMedia, setAvailableMedia] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [playlistsData, mediaData] = await Promise.all([
        apiService.getPlaylists(),
        apiService.getMedia()
      ]);
      
      setPlaylists(playlistsData);
      setMedia(mediaData.media || mediaData);
      setAvailableMedia(mediaData.media || mediaData);
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const playlistData = {
        ...formData,
        media: formData.media.map((item, index) => ({
          mediaId: item.mediaId || item._id,
          order: index,
          duration: item.duration
        }))
      };
      
      if (editingPlaylist) {
        await apiService.updatePlaylist(editingPlaylist._id, playlistData);
      } else {
        await apiService.createPlaylist(playlistData);
      }
      
      await loadData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar playlist:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (playlist) => {
    if (!confirm(`Tem certeza que deseja remover a playlist "${playlist.name}"?`)) {
      return;
    }
    
    try {
      await apiService.deletePlaylist(playlist._id);
      await loadData();
    } catch (error) {
      console.error('Erro ao remover playlist:', error);
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      media: []
    });
    setEditingPlaylist(null);
  };

  const openEditDialog = (playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      media: playlist.media?.map(item => ({
        ...item.mediaId,
        mediaId: item.mediaId._id,
        order: item.order,
        duration: item.duration
      })) || []
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const addMediaToPlaylist = (mediaItem) => {
    const isAlreadyAdded = formData.media.some(item => 
      (item.mediaId || item._id) === mediaItem._id
    );
    
    if (!isAlreadyAdded) {
      setFormData({
        ...formData,
        media: [...formData.media, {
          ...mediaItem,
          mediaId: mediaItem._id,
          order: formData.media.length
        }]
      });
    }
  };

  const removeMediaFromPlaylist = (index) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      media: newMedia.map((item, i) => ({ ...item, order: i }))
    });
  };

  const moveMediaInPlaylist = (fromIndex, toIndex) => {
    const newMedia = [...formData.media];
    const [movedItem] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, movedItem);
    
    setFormData({
      ...formData,
      media: newMedia.map((item, i) => ({ ...item, order: i }))
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalDuration = (mediaList) => {
    return mediaList.reduce((total, item) => {
      return total + (item.duration || item.mediaId?.duration || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Playlists</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Playlists</h2>
          <p className="text-gray-600">Organize sequências de reprodução para as TVs</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlaylist ? 'Editar Playlist' : 'Nova Playlist'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Playlist</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Playlist Principal"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição opcional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Media */}
                  <div>
                    <Label className="text-base font-medium">Mídias Disponíveis</Label>
                    <div className="mt-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {availableMedia.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Nenhuma mídia disponível
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {availableMedia.map((mediaItem) => (
                            <div
                              key={mediaItem._id}
                              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <FileVideo className="h-4 w-4 text-blue-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {mediaItem.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDuration(mediaItem.duration)}
                                  </p>
                                </div>
                              </div>
                              
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => addMediaToPlaylist(mediaItem)}
                                disabled={formData.media.some(item => 
                                  (item.mediaId || item._id) === mediaItem._id
                                )}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Playlist Media */}
                  <div>
                    <Label className="text-base font-medium">
                      Mídia na Playlist ({formData.media.length})
                    </Label>
                    <div className="mt-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {formData.media.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Adicione mídias à playlist
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {formData.media.map((item, index) => (
                            <div
                              key={`${item.mediaId || item._id}-${index}`}
                              className="flex items-center justify-between p-2 border rounded bg-blue-50"
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDuration(item.duration)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => moveMediaInPlaylist(index, index - 1)}
                                  >
                                    ↑
                                  </Button>
                                )}
                                
                                {index < formData.media.length - 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => moveMediaInPlaylist(index, index + 1)}
                                  >
                                    ↓
                                  </Button>
                                )}
                                
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeMediaFromPlaylist(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-4 p-2 bg-gray-50 rounded text-center">
                            <p className="text-sm font-medium">
                              Duração Total: {formatDuration(calculateTotalDuration(formData.media))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPlaylist ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma playlist encontrada</h3>
            <p className="text-gray-500 mb-6">
              Crie sua primeira playlist para organizar o conteúdo das TVs
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                    <span>{playlist.name}</span>
                  </CardTitle>
                  
                  <Badge variant="secondary">
                    {playlist.media?.length || 0} mídias
                  </Badge>
                </div>
                
                {playlist.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {playlist.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Playlist Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(calculateTotalDuration(playlist.media || []))}
                  </div>
                  
                  <div className="flex items-center">
                    <FileVideo className="h-4 w-4 mr-1" />
                    {playlist.media?.length || 0} itens
                  </div>
                </div>

                {/* Media Preview */}
                {playlist.media && playlist.media.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Conteúdo:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {playlist.media.slice(0, 5).map((item, index) => (
                        <div key={item.mediaId?._id || index} className="flex items-center space-x-2 text-xs">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {index + 1}
                          </span>
                          <span className="truncate flex-1">
                            {item.mediaId?.name || 'Mídia removida'}
                          </span>
                          <span className="text-gray-500">
                            {formatDuration(item.duration || item.mediaId?.duration)}
                          </span>
                        </div>
                      ))}
                      
                      {playlist.media.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{playlist.media.length - 5} mais...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(playlist)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(playlist)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>

                {/* Created Info */}
                <div className="text-xs text-gray-400 border-t pt-2">
                  Criada em {new Date(playlist.createdAt).toLocaleDateString()}
                  {playlist.createdBy && (
                    <span> por {playlist.createdBy.name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
