import { Suspense } from 'react'
import LoginForm from '@michalsy/aiko-webapp-core/login'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        title="Okaeri! 🌸"
        subtitle="Welcome to Aiko's Home"
        buttonText="Sign in with Google"
        backgroundImage="/bg.jpg"
        avatarImage="/avatar.jpg"
      />
    </Suspense>
  )
}
