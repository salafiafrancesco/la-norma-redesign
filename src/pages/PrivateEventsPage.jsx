import ExperiencePage from '../components/ExperiencePage/ExperiencePage';
import { experiencePageConfigs } from '../data/experiencePages';

export default function PrivateEventsPage() {
  return (
    <ExperiencePage
      config={experiencePageConfigs['private-events']}
    />
  );
}
