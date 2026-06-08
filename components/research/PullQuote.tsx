type Props = {
  quote: string;
  attribution?: string;
};

export function PullQuote({ quote, attribution }: Props) {
  return (
    <aside className="my-10 not-prose border-l-4 border-gold-500 pl-6 py-2">
      <p className="text-xl md:text-2xl font-display text-gray-100 leading-snug italic">&ldquo;{quote}&rdquo;</p>
      {attribution && <p className="mt-3 text-sm text-gold-400 font-medium">{attribution}</p>}
    </aside>
  );
}
