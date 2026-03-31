import ExperiencePage from '../components/ExperiencePage/ExperiencePage';
import { experiencePageConfigs } from '../data/experiencePages';

export default function LiveMusicPage() {
  return (
    <ExperiencePage
      config={experiencePageConfigs['live-music']}
    />
  );
}
