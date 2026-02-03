import { getLogoUrl } from '@/lib/logo'
import HeaderClient from './header-client'

export default async function Header() {
  const logoUrl = await getLogoUrl()
  return <HeaderClient logoUrl={logoUrl} />
}
