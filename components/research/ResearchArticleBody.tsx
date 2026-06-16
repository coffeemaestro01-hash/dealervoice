type Props = {
  content: string;
};

export function ResearchArticleBody({ content }: Props) {
  const html = content.includes("<") ? content : content.replace(/\n/g, "<br />");

  return (
    <div
      className="research-prose prose prose-invert prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-3
        prose-h3:text-xl prose-h3:text-primary
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary hover:prose-a:underline
        prose-strong:text-foreground
        prose-li:text-muted-foreground
        prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:italic
        prose-code:text-primary prose-code:bg-card prose-code:px-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
