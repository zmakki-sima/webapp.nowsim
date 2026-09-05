import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/cn";

export type LegalBlock =
  | { kind: "text"; body: React.ReactNode }
  | { kind: "list"; items: React.ReactNode[] }
  | { kind: "terms"; items: { term: string; body: React.ReactNode }[] }
  | { kind: "table"; columns: { heading: string; items: string[] }[] };

export type LegalPart = {
  title?: string;
  summary?: string;
  blocks: LegalBlock[];
};

export type LegalSection = {
  title?: string;
  summary?: string;
  blocks?: LegalBlock[];
  parts?: LegalPart[];
};

const prose = "text-base text-muted md:text-lg";

export const legalLink = cn(
  "font-medium text-ink underline underline-offset-4 hover:text-brand",
  "transition-colors duration-300 ease-hover",
  "motion-reduce:transition-none",
);

function Summary({ children }: { children: string }) {
  return (
    <p
      className={cn(
        "rounded-card bg-surface-soft",
        "px-5 py-4 text-base text-muted",
      )}
    >
      {children}
    </p>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "text") {
    return <p className={prose}>{block.body}</p>;
  }

  if (block.kind === "list") {
    return (
      <ul className={cn("flex flex-col gap-2 pl-5", prose)}>
        {block.items.map((item, index) => (
          <li key={index} className="list-disc marker:text-ink/30">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "terms") {
    return (
      <ul className="flex flex-col gap-4">
        {block.items.map(({ term, body }) => (
          <li key={term} className={prose}>
            <span className="font-bold text-ink">{term}:</span> {body}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-6 rounded-card border border-hairline p-5 md:grid-cols-3 md:gap-8 md:p-6">
      {block.columns.map((column) => (
        <div key={column.heading}>
          <h4 className="text-eyebrow uppercase tracking-[0.08em] text-ink/45">
            {column.heading}
          </h4>

          <ul className="mt-3 flex flex-col gap-2 pl-5 text-base text-muted">
            {column.items.map((item) => (
              <li key={item} className="list-disc marker:text-ink/30">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

export function LegalPage({
  title,
  lede,
  meta,
  sections,
}: {
  title: string;
  lede: string;
  meta?: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <section className="px-3 pb-20 pt-header md:px-4 md:py-28">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          className="mb-10"
          items={[{ label: "Home", href: "/" }, { label: title }]}
        />

        <h1 className="max-w-[18ch] font-display text-h1 font-extrabold uppercase tracking-[-0.045em]">
          {title}
        </h1>

        <p className="mt-5 max-w-[62ch] text-lg text-muted md:text-xl">
          {lede}
        </p>

        {meta ? <div className="mt-8 max-w-[75ch]">{meta}</div> : null}

        <div className="mt-12 flex max-w-[75ch] flex-col gap-12 md:mt-14 md:gap-14">
          {sections.map((section, index) => (
            <section key={section.title ?? index}>
              {section.title ? (
                <h2 className="text-xl font-bold tracking-[-0.02em] md:text-2xl">
                  {section.title}
                </h2>
              ) : null}

              {section.summary ? (
                <div className={section.title ? "mt-5" : undefined}>
                  <Summary>{section.summary}</Summary>
                </div>
              ) : null}

              {section.blocks?.length ? (
                <div className={section.title ? "mt-5" : undefined}>
                  <Blocks blocks={section.blocks} />
                </div>
              ) : null}

              {section.parts?.length ? (
                <div className="mt-8 flex flex-col gap-8">
                  {section.parts.map((part, index) => (
                    <div key={part.title ?? index}>
                      {part.title ? (
                        <h3 className="text-base font-bold tracking-[-0.01em] md:text-lg">
                          {part.title}
                        </h3>
                      ) : null}

                      {part.summary ? (
                        <p className="mt-2 text-base text-muted">
                          {part.summary}
                        </p>
                      ) : null}

                      <div className={part.title ? "mt-4" : undefined}>
                        <Blocks blocks={part.blocks} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
