import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ava — Assistant vocal',
  description: 'Discutez avec Ava, votre assistante IA vocale, directement depuis votre navigateur.',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc' }}>
      {children}
    </div>
  )
}
