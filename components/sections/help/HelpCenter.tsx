import { HelpCard } from "@/components/sections/help/HelpCard";
import { helpArticles } from "@/lib/help";

export function HelpCenter({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1 className="font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
        {title}
      </h1>

      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
        {helpArticles.map((article) => (
          <li key={article.id}>
            <HelpCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
