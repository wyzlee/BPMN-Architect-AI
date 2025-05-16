import { guideContents } from '@/lib/content/guide-content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return Object.keys(guideContents).map((slug) => ({
    slug,
  }));
}

interface GuidePageProps {
  params: {
    slug: string;
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  // Utilisation de params comme promesse
  const { slug } = await params;
  const section = guideContents[slug];

  if (!section) {
    notFound();
  }

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-primary prose-p:text-foreground/90 prose-strong:text-primary/95 prose-ul:text-foreground/80">
      {/* Title is already part of section.content */}
      {section.content}
    </div>
  );
}

export async function generateMetadata({ params }: GuidePageProps) {
  // Utilisation de params comme promesse
  const { slug } = await params;
  const section = guideContents[slug];

  if (!section) {
    return {
      title: 'Section non trouvée',
    };
  }

  return {
    title: `${section.title} | BPMN Architect AI`,
    description: `Apprenez ${section.title.toLowerCase()} dans BPMN 2.0.`,
  };
}
