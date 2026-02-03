import { getLogoUrl } from '@/lib/logo'
import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export async function Logo({ className = '', width = 100, height = 100 }: LogoProps) {
  const logoUrl = await getLogoUrl()

  return (
    <img
      src={logoUrl}
      alt="OLAPP"
      className={className}
      style={{ width, height }}
    />
  )
}
