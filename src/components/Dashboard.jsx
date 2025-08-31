import React, { useState, useEffect } from 'react';
import { Monitor, Users, Play, FileVideo, Plus, Upload, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import ApiService from '../services/api';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    totalPlaylists: 0,
    totalMedia: 0,
    totalFileSize: 0,
    totalDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await ApiService.getDashboardStats();
      setStats(statsData);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError('Erro ao carregar estatísticas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: 'Totens Cadastrados',
      value: stats.totalDevices,
      icon: Monitor,
      description: 'Dispositivos na rede'
    },
    {
      title: 'Online',
      value: stats.onlineDevices,
      icon: Users,
      description: 'Totens ativos agora',
      highlight: true
    },
    {
      title: 'Playlists',
      value: stats.totalPlaylists,
      icon: Play,
      description: 'Sequências criadas'
    },
    {
      title: 'Mídias',
      value: stats.totalMedia,
      icon: FileVideo,
      description: 'Vídeos na biblioteca'
    }
  ];

  const quickActions = [
    {
      title: 'Cadastrar Totem',
      description: 'Adicione novos dispositivos à sua rede',
      icon: Plus,
      action: () => onNavigate && onNavigate('totens'),
      className: 'quick-action-card'
    },
    {
      title: 'Upload de Mídia',
      description: 'Envie novos vídeos para sua biblioteca',
      icon: Upload,
      action: () => onNavigate && onNavigate('biblioteca'),
      className: 'quick-action-card'
    },
    {
      title: 'Nova Playlist',
      description: 'Crie sequências personalizadas de conteúdo',
      icon: PlayCircle,
      action: () => onNavigate && onNavigate('playlists'),
      className: 'quick-action-card'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadStats}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Sistema de Gestão de Mídias</h1>
        <p className="text-muted-foreground">
          Gerencie seus totens, faça upload de mídias e crie playlists para sua rede de Smart TVs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`stat-card ${stat.highlight ? 'stat-card-highlight' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`stat-icon ${stat.highlight ? 'stat-icon-highlight' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Armazenamento</CardTitle>
            <CardDescription>Espaço utilizado pela biblioteca de mídias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatFileSize(stats.totalFileSize)}
            </div>
            <p className="text-sm text-muted-foreground">
              Total de {stats.totalMedia} arquivo{stats.totalMedia !== 1 ? 's' : ''} de vídeo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duração Total</CardTitle>
            <CardDescription>Tempo total de conteúdo disponível</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatDuration(stats.totalDuration)}
            </div>
            <p className="text-sm text-muted-foreground">
              Horas de conteúdo audiovisual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className={action.className}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="action-icon">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-card-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <Button 
                      onClick={action.action}
                      className="w-full"
                    >
                      Acessar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

