import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import SkillsSection from './SkillsSection'
import ProjectsSection from './ProjectsSection'
import ExperienceSection from './ExperienceSection'
import ThreeBackground from './ThreeHero'

export default function PortfolioLayout() {
  return (
    <div style={{
      width: '100%',
      scrollBehavior: 'smooth'
    }}>
      <ThreeBackground />
      {/* Sections */}
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
    </div>
  )
} 