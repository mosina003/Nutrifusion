import { HeroSection } from '@/components/hero-section'
import { TrustStrip } from '@/components/trust-strip'
import { HowItWorks } from '@/components/how-it-works'
import { Features } from '@/components/features'
import { UserPractitioner } from '@/components/user-practitioner'
import { AIShowcase } from '@/components/ai-showcase'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <Features />
      <UserPractitioner />
      <AIShowcase />
      <CTASection />
      <Footer />
    </main>
  )
}
