import { useRouter } from 'next/router'
import { Button } from '@/shared/ui/Button'
import { ShieldCheck } from 'lucide-react'

export default function Custom404() {
  const router = useRouter()
  const goHome = () => router.push('/')

  return (
    <div className="flex  min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white p-8">
      <ShieldCheck className="mb-6 w-24 h-24 animate-pulse" />
      <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">404 – Page Not Found</h1>
      <p className="mb-6 text-lg max-w-xl text-center">Oops! The page you are looking for doesn't exist or has been moved. But don't worry, you can safely return to the home page.</p>
      <Button onClick={goHome} variant="primary" size="lg" className="animate-bounce">
        Go Home
      </Button>
    </div>
  )
}
