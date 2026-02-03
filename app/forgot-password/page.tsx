import { getLogoUrl } from '@/lib/logo'
import ForgotPasswordForm from './forgot-password-form'

export default async function ForgotPasswordPage() {
  const logoUrl = await getLogoUrl()
  return <ForgotPasswordForm logoUrl={logoUrl} />
}
