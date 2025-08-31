import React, { useState, useEffect } from 'react';
import { Play, Plus, Edit, Trash2, GripVertical, FileVideo, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ApiService from '../services/api';
import './Playlists.css';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [medias, setMedias] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedMedias, setSelectedMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playlistsData, mediasData] = await Promise.all([
        ApiService.getPlaylists(),
        ApiService.getMedias(),
      ]);
      setPlaylists(playlistsData);
      setMedias(mediasData);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;

    try {
      const playlistData = {
        name: playlistName,
        items: selectedMedias.map((mediaId, index) => ({
          mediaId,
          order: index + 1
        })),
        isGlobal: false
      };

      const newPlaylist = await ApiService.createPlaylist(playlistData);
      setPlaylists([...playlists, newPlaylist]);
      
      // Limpar formulário
      setPlaylistName('');
      setSelectedMedias([]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      setError('Erro ao criar playlist.');
    }
  };

  const handleEditPlaylist = async () => {
    if (!selectedPlaylist || !playlistName.trim()) return;

    try {
      const playlistData = {
        name: playlistName,
        items: selectedMedias.map((mediaId, index) => ({
          mediaId,
          order: index + 1
        }))
      };

      await ApiService.updatePlaylist(selectedPlaylist._id, playlistData);
      
      // Recarregar dados
      await loadData();
      
      // Limpar formulário
      setSelectedPlaylist(null);
      setPlaylistName('');
      setSelectedMedias([]);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao editar playlist:', error);
      setError('Erro ao editar playlist.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;

    try {
      await ApiService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
      setError('Erro ao excluir playlist.');
    }
  };

  const openEditDialog = (playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistName(playlist.name);
    setSelectedMedias(playlist.items.map(item => item.mediaId));
    setIsEditDialogOpen(true);
  };

  const handleMediaSelection = (mediaId, checked) => {
    if (checked) {
      setSelectedMedias([...selectedMedias, mediaId]);
    } else {
      setSelectedMedias(selectedMedias.filter(id => id !== mediaId));
    }
  };

  const moveMediaUp = (index) => {
    if (index > 0) {
      const newSelectedMedias = [...selectedMedias];
      [newSelectedMedias[index], newSelectedMedias[index - 1]] = 
      [newSelectedMedias[index - 1], newSelectedMedias[index]];
      setSelectedMedias(newSelectedMedias);
    }
  };

  const moveMediaDown = (index) => {
    if (index < selectedMedias.length - 1) {
      const newSelectedMedias = [...selectedMedias];
      [newSelectedMedias[index], newSelectedMedias[index + 1]] = 
      [newSelectedMedias[index + 1], newSelectedMedias[index]];
      setSelectedMedias(newSelectedMedias);
    }
  };

  const getMediaName = (mediaId) => {
    const media = medias.find(m => m._id === mediaId);
    return media ? media.name : 'Mídia não encontrada';
  };

  const getPlaylistDuration = (playlist) => {
    const totalSeconds = playlist.items.reduce((total, item) => {
      const media = medias.find(m => m._id === item.mediaId);
      return total + (media ? media.durationSec || 0 : 0);
    }, 0);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando playlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadData}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Playlists</h1>
          <p className="text-muted-foreground">
            Crie e gerencie sequências de reprodução para seus totens
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Playlist</DialogTitle>
              <DialogDescription>
                Crie uma nova sequência de reprodução selecionando as mídias desejadas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlistName">Nome da Playlist</Label>
                <Input
                  id="playlistName"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Ex: Playlist Promocional"
                />
              </div>
              
              <div>
                <Label>Selecionar Mídias</Label>
                <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
                  {medias.map((media) => (
                    <div key={media._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={media._id}
                        checked={selectedMedias.includes(media._id)}
                        onCheckedChange={(checked) => handleMediaSelection(media._id, checked)}
                      />
                      <Label htmlFor={media._id} className="flex-1 cursor-pointer">
                        {media.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMedias.length > 0 && (
                <div>
                  <Label>Ordem de Reprodução</Label>
                  <div className="space-y-2 mt-2">
                    {selectedMedias.map((mediaId, index) => (
                      <div key={mediaId} className="flex items-center space-x-2 p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="flex-1">{getMediaName(mediaId)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveMediaUp(index)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveMediaDown(index)}
                          disabled={index === selectedMedias.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePlaylist} disabled={!playlistName.trim() || selectedMedias.length === 0}>
                Criar Playlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Playlist</DialogTitle>
            <DialogDescription>
              Modifique o nome e as mídias da playlist selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editPlaylistName">Nome da Playlist</Label>
              <Input
                id="editPlaylistName"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Ex: Playlist Promocional"
              />
            </div>
            
            <div>
              <Label>Selecionar Mídias</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
                {medias.map((media) => (
                  <div key={media._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${media._id}`}
                      checked={selectedMedias.includes(media._id)}
                      onCheckedChange={(checked) => handleMediaSelection(media._id, checked)}
                    />
                    <Label htmlFor={`edit-${media._id}`} className="flex-1 cursor-pointer">
                      {media.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {selectedMedias.length > 0 && (
              <div>
                <Label>Ordem de Reprodução</Label>
                <div className="space-y-2 mt-2">
                  {selectedMedias.map((mediaId, index) => (
                    <div key={mediaId} className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="flex-1">{getMediaName(mediaId)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveMediaUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveMediaDown(index)}
                        disabled={index === selectedMedias.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPlaylist} disabled={!playlistName.trim() || selectedMedias.length === 0}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <Card key={playlist._id} className="playlist-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <List className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{playlist.name}</CardTitle>
                </div>
                {playlist.isGlobal && (
                  <Badge variant="secondary">Global</Badge>
                )}
              </div>
              <CardDescription>
                {playlist.items.length} mídia{playlist.items.length !== 1 ? 's' : ''} • {getPlaylistDuration(playlist)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Mídias na Playlist</Label>
                <div className="mt-2 space-y-1">
                  {playlist.items.length > 0 ? (
                    playlist.items
                      .sort((a, b) => a.order - b.order)
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={item._id || index} className="text-sm text-muted-foreground flex items-center">
                          <span className="mr-2">{item.order}.</span>
                          <FileVideo className="h-3 w-3 mr-1" />
                          {getMediaName(item.mediaId)}
                        </div>
                      ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma mídia</span>
                  )}
                  {playlist.items.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{playlist.items.length - 3} mais...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Criada em</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditDialog(playlist)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeletePlaylist(playlist._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="text-center py-12">
          <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma playlist encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira playlist para organizar suas mídias
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Playlist
          </Button>
        </div>
      )}
    </div>
  );
};

export default Playlists;

