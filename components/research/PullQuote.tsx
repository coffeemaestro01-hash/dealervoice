type Props = {
  quote: string;
  attribution?: string;
};

export function PullQuote({ quote, attribution }: Props) {
  return (
    <aside className="my-10 not-prose border-l-4 border-primary/30 pl-6 py-2">
      <p className="text-xl md:text-2xl font-display text-foreground leading-snug italic">&ldquo;{quote}&rdquo;</p>
      {attribution && <p className="mt-3 text-sm text-primary font-medium">{attribution}</p>}
    </aside>
  );
}
