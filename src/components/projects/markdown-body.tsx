import { Fragment, type ReactNode } from "react";
import { cn } from "cn";

// Renders the light Markdown subset the architect prompt is instructed to
// produce (paragraphs, "- " bullet lists, "### " sub-headings, **bold**).
// A real Markdown lib would pull in a dependency and a sanitizer for ~20
// lines of value — this covers exactly the subset we generate, as plain
// React elements (no dangerouslySetInnerHTML, so nothing to sanitize).
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

// Line-based rather than blank-line-block-based: a "### " subheading is
// often immediately followed by a bullet list with no blank line between
// them (expected now that sections are asked to split into subsections),
// and block-splitting on \n{2,} would swallow the bullets into the
// heading's own text in that case.
export function MarkdownBody({ text, className }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={key}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc space-y-1.5 pl-5">
        {list.map((item, j) => (
          <li key={j}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    list = [];
  };

  text
    .trim()
    .split("\n")
    .forEach((raw, i) => {
      const line = raw.trim();

      if (!line) {
        flushParagraph(`p-${i}`);
        flushList(`ul-${i}`);
        return;
      }
      if (line.startsWith("### ")) {
        flushParagraph(`p-${i}`);
        flushList(`ul-${i}`);
        blocks.push(
          <h3 key={`h-${i}`} className="pt-1 text-base font-semibold text-foreground">
            {renderInline(line.slice(4))}
          </h3>
        );
        return;
      }
      if (line.startsWith("- ")) {
        flushParagraph(`p-${i}`);
        list.push(line.slice(2));
        return;
      }
      flushList(`ul-${i}`);
      paragraph.push(line);
    });

  flushParagraph("p-end");
  flushList("ul-end");

  return <div className={cn("space-y-3 text-[0.95rem] leading-relaxed text-foreground", className)}>{blocks}</div>;
}
