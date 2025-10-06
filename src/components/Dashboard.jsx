import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tv, 
  PlayCircle, 
  Database, 
  HardDrive, 
  Activity,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import apiService from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, devicesData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getDevices()
      ]);
      
      setStats(statsData);
      setDevices(devicesData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDeviceStatusColor = (status) => {
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

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-700">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Erro ao carregar dados</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral do sistema Tritotem</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <Clock className="h-4 w-4 inline mr-1" />
            Atualizado: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Tv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.devices?.total || 0}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {stats?.devices?.online || 0} online
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                {stats?.devices?.offline || 0} offline
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.playlists?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sequências de reprodução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mídias</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.media?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Arquivos de vídeo e imagem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.media?.storage?.usedFormatted || '0 MB'}
            </div>
            <p className="text-xs text-muted-foreground">
              Espaço utilizado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Status dos Dispositivos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tv className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum dispositivo cadastrado</p>
                </div>
              ) : (
                devices.slice(0, 5).map((device) => (
                  <div key={device._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getDeviceStatusColor(device.status)}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{device.name}</p>
                        <p className="text-sm text-gray-500">{device.location || 'Local não definido'}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                        {device.status === 'online' ? (
                          <><Wifi className="h-3 w-3 mr-1" />Online</>
                        ) : (
                          <><WifiOff className="h-3 w-3 mr-1" />Offline</>
                        )}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getLastSeenText(device.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {devices.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    E mais {devices.length - 5} dispositivos...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resumo do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tv className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Taxa de Dispositivos Online</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.devices?.total > 0 
                    ? Math.round((stats.devices.online / stats.devices.total) * 100)
                    : 0
                  }%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Mídias por Playlist</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats?.playlists?.total > 0 
                    ? Math.round((stats.media.total || 0) / stats.playlists.total)
                    : 0
                  }
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Tamanho Médio por Mídia</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {stats?.media?.total > 0 
                    ? formatBytes((stats.media.storage?.used || 0) / stats.media.total)
                    : '0 MB'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
