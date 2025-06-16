import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import SkillsSection from './SkillsSection'
import ProjectsSection from './ProjectsSection'
import ExperienceSection from './ExperienceSection'
import ContactSection from './ContactSection'

export default function PortfolioLayout() {
  return (
    <div style={{
      width: '100%',
      scrollBehavior: 'smooth'
    }}>
      {/* Navigation is now handled by NavigationDock in Hero section */}

      {/* Sections */}
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
} 