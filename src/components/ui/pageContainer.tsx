import { type ReactNode } from 'react'

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="p-4 md:p-6 max-w-5xl mx-auto">{children}</div>
}
