import React, { useState, useEffect } from 'react';
import { Monitor, Plus, Copy, Trash2, Settings, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import ApiService from '../services/api';
import './Totens.css';

const Totens = () => {
  const [devices, setDevices] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, playlistsData] = await Promise.all([
        ApiService.getDevices(),
        ApiService.getPlaylists(),
      ]);
      setDevices(devicesData);
      setPlaylists(playlistsData);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) return;

    try {
      const newDevice = await ApiService.createDevice({ name: newDeviceName });
      setDevices([...devices, newDevice]);
      setNewDeviceName('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
      setError('Erro ao criar dispositivo.');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      await ApiService.deleteDevice(deviceId);
      setDevices(devices.filter(device => device._id !== deviceId));
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
      setError('Erro ao excluir dispositivo.');
    }
  };

  const handleCopyPlayerUrl = (deviceToken) => {
    const url = `${window.location.origin.replace(':5173', ':3001')}/player/${deviceToken}`;
    navigator.clipboard.writeText(url);
    // Aqui você pode adicionar uma notificação de sucesso
    alert('URL copiada para a área de transferência!');
  };

  const handleAssignPlaylist = async (deviceId, playlistId) => {
    try {
      await ApiService.updateDevice(deviceId, { assignedPlaylistId: playlistId });
      // Recarregar dados para atualizar a interface
      await loadData();
    } catch (error) {
      console.error('Erro ao atribuir playlist:', error);
      setError('Erro ao atribuir playlist.');
    }
  };

  const handleBroadcastAssign = async () => {
    if (!selectedPlaylist) return;

    try {
      await ApiService.broadcastAssignPlaylist(selectedPlaylist);
      setSelectedPlaylist('');
      // Recarregar dados para atualizar a interface
      await loadData();
    } catch (error) {
      console.error('Erro ao atribuir playlist globalmente:', error);
      setError('Erro ao atribuir playlist globalmente.');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === 'online' ? 'default' : 'secondary'} className="status-badge">
        <Circle className={`h-2 w-2 mr-1 ${status === 'online' ? 'fill-green-500' : 'fill-gray-500'}`} />
        {status === 'online' ? 'Online' : 'Offline'}
      </Badge>
    );
  };

  const getPlaylistName = (playlistId) => {
    const playlist = playlists.find(p => p._id === playlistId);
    return playlist ? playlist.name : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando totens...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Totens</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie seus dispositivos de exibição
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Totem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Totem</DialogTitle>
              <DialogDescription>
                Cadastre um novo dispositivo para sua rede de totens.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceName">Nome do Totem</Label>
                <Input
                  id="deviceName"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Ex: Totem Recepção"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddDevice}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Broadcast Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Atribuição Global</CardTitle>
          <CardDescription>
            Atribua uma playlist para todos os totens de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma playlist" />
              </SelectTrigger>
              <SelectContent>
                {playlists.map((playlist) => (
                  <SelectItem key={playlist._id} value={playlist._id}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleBroadcastAssign} disabled={!selectedPlaylist}>
              Aplicar a Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device._id} className="device-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                </div>
                {getStatusBadge(device.status)}
              </div>
              <CardDescription>
                Token: {device.deviceToken.substring(0, 8)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Playlist Atribuída</Label>
                <div className="mt-1">
                  {device.assignedPlaylistId ? (
                    <Badge variant="outline">{getPlaylistName(device.assignedPlaylistId)}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma playlist</span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Última Conexão</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(device.lastSeenAt).toLocaleString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPlayerUrl(device.deviceToken)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar URL
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteDevice(device._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Select onValueChange={(value) => handleAssignPlaylist(device._id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atribuir playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map((playlist) => (
                      <SelectItem key={playlist._id} value={playlist._id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum totem encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando seu primeiro totem
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Totem
          </Button>
        </div>
      )}
    </div>
  );
};

export default Totens;

