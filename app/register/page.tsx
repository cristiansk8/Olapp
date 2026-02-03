import { getLogoUrl } from '@/lib/logo'
import RegisterForm from './register-form'

export default async function RegisterPage() {
  const logoUrl = await getLogoUrl()
  return <RegisterForm logoUrl={logoUrl} />
}
