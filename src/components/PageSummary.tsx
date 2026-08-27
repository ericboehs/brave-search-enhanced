import { Detail, ActionPanel, Action } from "@raycast/api";
import { useAI, useFetch } from "@raycast/utils";

const MAX_PAGE_CHARS = 8000;

interface PageSummaryProps {
  title: string;
  url: URL;
}

export default function PageSummary({ title, url }: PageSummaryProps) {
  const readerUrl = "https://r.jina.ai/" + url.toString();

  const {
    data: pageText,
    isLoading: isLoadingPage,
    error: pageError,
  } = useFetch<string>(readerUrl, {
    parseResponse: (response) => response.text(),
    keepPreviousData: false,
  });

  const prompt = [
    `Summarize the web page "${title}" (${url.toString()}).`,
    "Write a concise markdown summary: one short intro sentence, then 3-5 bullet points with the key takeaways.",
    "",
    "Page content:",
    (pageText ?? "").slice(0, MAX_PAGE_CHARS),
  ].join("\n");

  const { data: summary, isLoading: isSummarizing, error: aiError } = useAI(prompt, { execute: Boolean(pageText) });

  let markdown = "";
  if (pageError) {
    markdown = `Could not fetch this page for summarization.\n\n\`${pageError.message}\``;
  } else if (aiError) {
    markdown = `AI summarization failed.\n\n\`${aiError.message}\``;
  } else {
    markdown = summary || "Fetching page and generating summary…";
  }

  return (
    <Detail
      navigationTitle={`Summary: ${title}`}
      markdown={markdown}
      isLoading={isLoadingPage || isSummarizing}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={url.toString()} />
          <Action.CopyToClipboard title="Copy URL" content={url.toString()} />
          <Action.CopyToClipboard
            title="Copy Markdown Link"
            shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
            content={`[${title}](${url.toString()})`}
          />
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Link title="Source" target={url.toString()} text={title} />
        </Detail.Metadata>
      }
    />
  );
}
