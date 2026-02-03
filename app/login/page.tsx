import { getLogoUrl } from '@/lib/logo'
import LoginForm from './login-form'

export default async function LoginPage() {
  const logoUrl = await getLogoUrl()
  return <LoginForm logoUrl={logoUrl} />
}
