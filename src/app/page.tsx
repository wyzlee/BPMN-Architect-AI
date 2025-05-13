import { guideContents } from '@/lib/content/guide-content';
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the introduction guide page
  redirect('/guide/intro');
  
  // Or, if you prefer to render content directly on home:
  // const introContent = guideContents['intro'];
  // if (!introContent) {
  //   return <div>Contenu non trouvé.</div>;
  // }
  // return <div className="space-y-8">{introContent.content}</div>;
}
