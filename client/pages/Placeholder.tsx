import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, Construction, MessageCircle } from 'lucide-react';

interface PlaceholderProps {
  page: string;
  description: string;
}

export default function Placeholder({ page, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light via-background to-medical-green-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-medical-blue text-white p-2 rounded-lg">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">AI-FatMoS</h1>
                  <p className="text-sm text-muted-foreground">Sistem Pemantauan Kelelahan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-medical-orange text-white p-4 rounded-full w-fit mb-4">
                <Construction className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl">{page}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
              
              <div className="bg-medical-blue-light/10 p-6 rounded-lg">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-medical-blue" />
                  <span className="font-semibold text-medical-blue">Halaman Dalam Pengembangan</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Halaman ini sedang dalam tahap pengembangan. Untuk melanjutkan implementasi fitur ini, 
                  silakan lanjutkan dengan memberikan instruksi lebih lanjut.
                </p>
                <p className="text-sm text-muted-foreground">
                  Fitur yang akan tersedia: interface lengkap, integrasi dengan backend, 
                  dan fungsionalitas sesuai dengan spesifikasi AI-FatMoS.
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/">
                  <Button variant="outline" className="w-full border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
                    Kembali ke Beranda
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  Sistem AI-FatMoS © 2024 - Pemantauan Kelelahan Tenaga Kesehatan
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
