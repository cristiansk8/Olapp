import { getLogoUrl } from '@/lib/logo'
import ResetPasswordForm from './reset-password-form'

export default async function ResetPasswordPage() {
  const logoUrl = await getLogoUrl()
  return <ResetPasswordForm logoUrl={logoUrl} />
}
