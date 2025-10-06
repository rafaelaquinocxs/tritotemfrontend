import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, LogIn, UserPlus, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, initAdmin, loading, error, clearError } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [initData, setInitData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(loginData.email, loginData.password);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  const handleInit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (initData.password !== initData.confirmPassword) {
      return; // Adicionar validação visual
    }
    
    try {
      await initAdmin(initData.name, initData.email, initData.password);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Monitor className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tritotem</h1>
              <p className="text-sm text-gray-600">Sistema de Gestão de Mídia Digital</p>
            </div>
          </div>
          <p className="text-gray-600">
            Gerencie conteúdo para TVs smart TCL Android
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Acesso ao Sistema</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="init">Primeiro Acesso</TabsTrigger>
              </TabsList>
              
              {/* Error Alert */}
              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Sua senha"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Primeiro acesso?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('init')}
                      className="text-blue-600 hover:underline"
                    >
                      Configure o sistema
                    </button>
                  </p>
                </div>
              </TabsContent>
              
              {/* Init Tab */}
              <TabsContent value="init">
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Primeiro Acesso:</strong> Configure o administrador do sistema.
                    Esta opção só estará disponível se nenhum administrador foi criado ainda.
                  </p>
                </div>
                
                <form onSubmit={handleInit} className="space-y-4">
                  <div>
                    <Label htmlFor="init-name">Nome Completo</Label>
                    <Input
                      id="init-name"
                      value={initData.name}
                      onChange={(e) => setInitData({...initData, name: e.target.value})}
                      placeholder="Seu nome completo"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="init-email">Email</Label>
                    <Input
                      id="init-email"
                      type="email"
                      value={initData.email}
                      onChange={(e) => setInitData({...initData, email: e.target.value})}
                      placeholder="admin@empresa.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="init-password">Senha</Label>
                    <Input
                      id="init-password"
                      type="password"
                      value={initData.password}
                      onChange={(e) => setInitData({...initData, password: e.target.value})}
                      placeholder="Senha segura"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="init-confirm-password">Confirmar Senha</Label>
                    <Input
                      id="init-confirm-password"
                      type="password"
                      value={initData.confirmPassword}
                      onChange={(e) => setInitData({...initData, confirmPassword: e.target.value})}
                      placeholder="Confirme a senha"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    {initData.password && initData.confirmPassword && 
                     initData.password !== initData.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || initData.password !== initData.confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Configurar Sistema
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-blue-600 hover:underline"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Tritotem v2.0 - Sistema de Mídia Digital</p>
          <p>Para TVs smart TCL Android</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
