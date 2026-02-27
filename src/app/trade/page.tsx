import { Swap } from '@/components/trade/components/swap'
import { Suspense } from 'react'

export default function TradePage() {
  return (
    <div className="px-4 py-4">
      <Suspense>
        <Swap />
      </Suspense>
    </div>
  )
}
