import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'talk-to-my-lawyer - Professional Legal Letters | Local Lawyer Drafter Letter for Conflict Resolution',
  description: 'Get Local Lawyer Drafter Letters for conflict resolution. Professional legal communication without expensive lawyer consultations. Effective, professionally crafted letters that get results.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`} suppressHydrationWarning={true}>
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  )
}
