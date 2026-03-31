import ExperiencePage from '../components/ExperiencePage/ExperiencePage';
import { experiencePageConfigs } from '../data/experiencePages';

export default function WineTastingsPage() {
  return (
    <ExperiencePage
      config={experiencePageConfigs['wine-tastings']}
    />
  );
}
