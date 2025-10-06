import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tv, 
  Plus, 
  Edit, 
  Trash2, 
  Wifi, 
  WifiOff, 
  ExternalLink,
  Copy,
  RefreshCw,
  MapPin,
  Monitor,
  Clock
} from 'lucide-react';
import apiService from '../services/api';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    resolution: '1920x1080'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [devicesData, playlistsData] = await Promise.all([
        apiService.getDevices(),
        apiService.getPlaylists()
      ]);
      
      setDevices(devicesData);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
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
      if (editingDevice) {
        await apiService.updateDevice(editingDevice._id, formData);
      } else {
        await apiService.createDevice(formData);
      }
      
      await loadData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (device) => {
    if (!confirm(`Tem certeza que deseja remover o dispositivo "${device.name}"?`)) {
      return;
    }
    
    try {
      await apiService.deleteDevice(device._id);
      await loadData();
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error);
      setError(error.message);
    }
  };

  const handleAssignPlaylist = async (deviceId, playlistId) => {
    try {
      await apiService.updateDevice(deviceId, { assignedPlaylistId: playlistId });
      await loadData();
    } catch (error) {
      console.error('Erro ao atribuir playlist:', error);
      setError(error.message);
    }
  };

  const handleBroadcastAssign = async (playlistId) => {
    if (!confirm('Tem certeza que deseja atribuir esta playlist a TODOS os dispositivos?')) {
      return;
    }
    
    try {
      await apiService.broadcastAssignPlaylist(playlistId);
      await loadData();
    } catch (error) {
      console.error('Erro na atribuição em massa:', error);
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      resolution: '1920x1080'
    });
    setEditingDevice(null);
  };

  const openEditDialog = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      location: device.location || '',
      resolution: device.resolution || '1920x1080'
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aqui você poderia adicionar uma notificação de sucesso
  };

  const getPlayerUrl = (deviceToken) => {
    return apiService.getPlayerUrl(deviceToken);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getLastSeenText = (lastSeenAt) => {
    const now = new Date();
    const lastSeen = new Date(lastSeenAt);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dispositivos (TVs)</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Dispositivos (TVs)</h2>
          <p className="text-gray-600">Gerencie as TVs smart TCL Android conectadas ao sistema</p>
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
                Novo Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Dispositivo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: TV Recepção Principal"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ex: Recepção - 1º Andar"
                  />
                </div>
                
                <div>
                  <Label htmlFor="resolution">Resolução</Label>
                  <Select 
                    value={formData.resolution} 
                    onValueChange={(value) => setFormData({...formData, resolution: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                      <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                      <SelectItem value="1366x768">1366x768 (HD)</SelectItem>
                      <SelectItem value="1280x720">1280x720 (HD Ready)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingDevice ? 'Salvar' : 'Criar'}
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

      {/* Broadcast Assignment */}
      {playlists.length > 0 && devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atribuição em Massa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select onValueChange={handleBroadcastAssign}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Atribuir playlist a todos os dispositivos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Remover playlist de todos</SelectItem>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist._id} value={playlist._id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Atribui a playlist selecionada a todos os {devices.length} dispositivos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Tv className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dispositivo cadastrado</h3>
            <p className="text-gray-500 mb-6">
              Cadastre sua primeira TV smart TCL Android para começar a exibir conteúdo
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Dispositivo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                  </div>
                  
                  <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                    {device.status === 'online' ? (
                      <><Wifi className="h-3 w-3 mr-1" />Online</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" />Offline</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Device Info */}
                <div className="space-y-2">
                  {device.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {device.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Monitor className="h-4 w-4 mr-2" />
                    {device.resolution}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {getLastSeenText(device.lastSeenAt)}
                  </div>
                </div>

                {/* Assigned Playlist */}
                <div>
                  <Label className="text-sm font-medium">Playlist Atribuída</Label>
                  <Select 
                    value={device.assignedPlaylistId?._id || ''} 
                    onValueChange={(value) => handleAssignPlaylist(device._id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Nenhuma playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma playlist</SelectItem>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist._id} value={playlist._id}>
                          {playlist.name} ({playlist.media?.length || 0} mídias)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Player URL */}
                <div>
                  <Label className="text-sm font-medium">URL do Player</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={getPlayerUrl(device.deviceToken)}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getPlayerUrl(device.deviceToken))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getPlayerUrl(device.deviceToken), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(device)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(device)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Devices;
