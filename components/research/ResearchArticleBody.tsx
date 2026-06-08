type Props = {
  content: string;
};

export function ResearchArticleBody({ content }: Props) {
  const html = content.includes("<") ? content : content.replace(/\n/g, "<br />");

  return (
    <div
      className="research-prose prose prose-invert prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-white
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
        prose-h3:text-xl prose-h3:text-gold-300
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-gold-400 prose-a:no-underline hover:prose-a:text-gold-300 hover:prose-a:underline
        prose-strong:text-white
        prose-li:text-gray-300
        prose-blockquote:border-gold-500 prose-blockquote:text-gray-200 prose-blockquote:italic
        prose-code:text-gold-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
