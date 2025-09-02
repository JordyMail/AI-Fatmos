import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  Users, 
  FileText, 
  Shield,
  Bell,
  User,
  LogOut,
  Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: 'nakes' | 'supervisor' | 'admin' | 'psikolog';
  userName?: string;
}

export default function DashboardLayout({ 
  children, 
  userRole = 'nakes', 
  userName = 'Dr. Sarah' 
}: DashboardLayoutProps) {
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', icon: Home, label: 'Beranda' },
      { path: '/dashboard', icon: BarChart3, label: 'Dashboard Pribadi' },
      { path: '/reports', icon: FileText, label: 'Laporan & Riwayat' },
    ];

    const roleSpecificItems = {
      supervisor: [
        { path: '/team', icon: Users, label: 'Manajemen Tim' },
        { path: '/alerts', icon: Bell, label: 'Notifikasi' },
      ],
      admin: [
        { path: '/management', icon: BarChart3, label: 'Dashboard Manajemen' },
        { path: '/admin', icon: Settings, label: 'Administrasi' },
        { path: '/devices', icon: Shield, label: 'Manajemen Perangkat' },
      ],
      psikolog: [
        { path: '/clinical', icon: Shield, label: 'Akses Klinis' },
        { path: '/followup', icon: Users, label: 'Tindak Lanjut' },
      ],
      nakes: []
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const getRoleBadge = () => {
    const roleConfig = {
      nakes: { label: 'Tenaga Kesehatan', color: 'bg-medical-green' },
      supervisor: { label: 'Supervisor', color: 'bg-medical-blue' },
      admin: { label: 'Administrator', color: 'bg-medical-red' },
      psikolog: { label: 'Psikolog', color: 'bg-medical-orange' }
    };
    
    return roleConfig[userRole] || roleConfig.nakes;
  };

  const navigationItems = getNavigationItems();
  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-blue text-white p-2 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI-FatMoS</h1>
                <p className="text-sm text-muted-foreground">Sistem Pemantauan Kelelahan</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{userName}</div>
                <Badge className={`${roleBadge.color} text-white text-xs`}>
                  {roleBadge.label}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r min-h-[calc(100vh-80px)]">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-medical-blue hover:bg-medical-blue/90 text-white" 
                        : "hover:bg-medical-blue-light/20"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 AI-FatMoS - Sistem Pemantauan Kelelahan Tenaga Kesehatan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
