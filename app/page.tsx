import Link from 'next/link';
import { Camera, Mic, Sparkles, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Asistente de Venta
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Listá tus artículos usados más rápido con IA
          </p>
          <Link href="/wizard">
            <Button size="lg" className="text-lg px-8 py-6">
              Empezar a Vender
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Camera className="w-12 h-12 mb-2 text-blue-600" />
              <CardTitle>Capturá Fotos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sacá fotos de tu artículo con tu teléfono
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="w-12 h-12 mb-2 text-purple-600" />
              <CardTitle>Describí con Voz</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Contá sobre tu artículo usando tu voz o escribiendo
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-12 h-12 mb-2 text-pink-600" />
              <CardTitle>Análisis con IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                La IA genera automáticamente título, descripción y precio
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileSpreadsheet className="w-12 h-12 mb-2 text-green-600" />
              <CardTitle>Exportar a Sheets</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Guardá toda la información en Google Sheets
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
