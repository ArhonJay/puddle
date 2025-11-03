import { MainLayout } from '@/components/layout';
import { PixelScene, HeroSection, FeaturesSection } from '@/components/landing';
import { AdditionalSections } from '@/components/landing/AdditionalSections';

export default function LandingPage() {
  return (
    <MainLayout>
      <div className="relative min-h-screen">
        {/* Pixel Scene Background - Fixed position */}
        <div className="fixed inset-0 w-full h-screen -z-10">
          <PixelScene className="w-full h-full" />
        </div>

        {/* Gradient Overlay for better text readability */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 -z-10" />

        {/* Hero Section */}
        <HeroSection showScrollHint={true} />

        {/* Features Section with background */}
        <div className="relative bg-gradient-to-b from-[var(--color-sky-dark)] via-[#1e3a52] to-[#0f1d2b]">
          <FeaturesSection />
        </div>

        {/* Additional Sections */}
        <div className="relative bg-[#0f1d2b]">
          <AdditionalSections />
        </div>

        {/* Footer */}
        <footer className="relative bg-black/50 backdrop-blur-sm border-t border-white/10 py-12 px-4">
          <div className="container-responsive max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white/70">
              <div>
                <h3 className="text-white font-bold mb-4">Puddle</h3>
                <p className="text-sm">
                  Simple savings dApps on blockchain with an RPG-style interface.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
              <p>&copy; {new Date().getFullYear()} Puddle. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}

