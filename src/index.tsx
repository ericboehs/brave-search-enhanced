import { Keyboard, List, ActionPanel, Action, Icon, LaunchProps } from "@raycast/api";
import { useState, useMemo, useCallback } from "react";

import useWebSearch from "./hooks/useWebSearch.js";
import useHistory, { Type } from "./hooks/useHistory.js";

import groupHistory from "./utils/groupHistory.js";
import formatUrl from "./utils/formatUrl.js";
import useSuggestions from "./hooks/useSuggestions.js";
import useMode from "./hooks/useMode.js";
import HistoryListItem from "./components/HistoryListItem.js";
import PageSummary from "./components/PageSummary.js";

enum Mode {
  History,
  Suggestions,
  Search,
}

export default function Index(props: LaunchProps<{ arguments: { filter?: string } }>) {
  const [fallbackText, setFallbackText] = useState(props.fallbackText);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useMode();
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { isLoadingHistory, historyItems, addHistoryItem, removeHistoryItem, clearHistory } = useHistory(Type.Web);
  const { isLoadingSuggestions, suggestionsResults } = useSuggestions(query, mode === Mode.Suggestions);
  const { isLoadingWebSearch, webSearchResults } = useWebSearch(query, mode === Mode.Search);

  const historyGroups = useMemo(() => groupHistory(historyItems), [historyItems]);
  const isLoading = isLoadingHistory || isLoadingSuggestions || isLoadingWebSearch;

  const filter = (isFilterMode ? filterText : props.arguments.filter)?.trim().toLowerCase() ?? "";

  const filteredWebSearchResults = useMemo(() => {
    if (filter.length === 0) return webSearchResults;

    return webSearchResults.filter((searchResult) =>
      [searchResult.title, searchResult.description, searchResult.url.toString()]
        .join("\n")
        .toLowerCase()
        .includes(filter),
    );
  }, [webSearchResults, filter]);

  const onSearchTextChange = useCallback(
    (text: string) => {
      // In filter mode, editing the search bar only filters the current results
      if (isFilterMode) {
        setFilterText(text);
        return;
      }

      // When called as a fallback, Raycast calls this function with the fallback text, which should invoke the search.
      // The fallback text is not added to the history as it's already part of the Raycast history.
      const fallbackTextSearchTextChange = fallbackText === text;

      setQuery(text);

      if (fallbackTextSearchTextChange) {
        setMode(Mode.Search);
      } else {
        if (text.length > 0) {
          setMode(Mode.Suggestions);
        } else {
          setMode(Mode.History);
        }
      }

      // Avoid that upcoming function calls are treated as fallback calls
      setFallbackText(undefined);
    },
    [fallbackText, setMode, setQuery, setFallbackText, isFilterMode],
  );

  const toggleFilterMode = useCallback(() => {
    setIsFilterMode((previous) => {
      // Entering filter mode clears the search bar so a fresh filter can be typed
      if (!previous) setFilterText("");
      return !previous;
    });
  }, []);

  const historyList = historyGroups.map((historyGroup) => (
    <List.Section key={historyGroup.title} title={historyGroup.title}>
      {historyGroup.items.map((item) => (
        <HistoryListItem
          key={item.id}
          item={item}
          addHistoryItem={addHistoryItem}
          removeHistoryItem={removeHistoryItem}
          clearHistory={clearHistory}
          setQuery={setQuery}
          setMode={setMode}
        />
      ))}
    </List.Section>
  ));

  const suggestionsList = (
    <List.Section title="Suggestions">
      {suggestionsResults.map((suggestionsResult) => (
        <List.Item
          key={suggestionsResult.id}
          icon={Icon.MagnifyingGlass}
          title={suggestionsResult.query}
          subtitle={`Search web for '${suggestionsResult.query}'`}
          actions={
            <ActionPanel>
              <Action
                icon={Icon.MagnifyingGlass}
                title="Search"
                onAction={() => {
                  addHistoryItem(suggestionsResult.query);
                  setQuery(suggestionsResult.query);
                  setMode(Mode.Search);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );

  const webSearchList = (
    <List.Section
      title={
        filter.length > 0 ? `Results (${filteredWebSearchResults.length} of ${webSearchResults.length})` : "Results"
      }
    >
      {filteredWebSearchResults.map((searchResult) => (
        <List.Item
          key={searchResult.id}
          icon={searchResult.icon}
          title={searchResult.title}
          subtitle={formatUrl(searchResult.url)}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.OpenInBrowser url={searchResult.url.toString()} />
                <Action.Push
                  icon={Icon.Wand}
                  title="Summarize Page"
                  shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
                  target={<PageSummary title={searchResult.title} url={searchResult.url} />}
                />
                <Action.OpenWith shortcut={Keyboard.Shortcut.Common.OpenWith} path={searchResult.url.toString()} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action.CopyToClipboard
                  title="Copy URL"
                  shortcut={Keyboard.Shortcut.Common.Copy}
                  content={searchResult.url.toString()}
                />
                <Action.CopyToClipboard
                  title="Copy Title"
                  shortcut={Keyboard.Shortcut.Common.CopyName}
                  content={searchResult.title}
                />
                <Action.CopyToClipboard
                  title="Copy Markdown Link"
                  shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
                  content={`[${searchResult.title}](${searchResult.url.toString()})`}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  icon={Icon.Filter}
                  title={isFilterMode ? "Show All Results" : "Filter Results"}
                  shortcut={{ modifiers: ["cmd"], key: "f" }}
                  onAction={toggleFilterMode}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );

  return (
    <List
      searchText={isFilterMode ? filterText : query}
      onSearchTextChange={onSearchTextChange}
      isLoading={isLoading}
      filtering={false}
      searchBarPlaceholder={isFilterMode ? "Filter results" : "Search Brave"}
    >
      {mode === Mode.History && historyList}
      {mode === Mode.Suggestions && suggestionsList}
      {mode === Mode.Search && webSearchList}
    </List>
  );
}
