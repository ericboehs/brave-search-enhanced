# Brave Search Enhanced

Get [Brave Search](https://search.brave.com) search suggestions and results in Raycast using the APIs of Brave.

# Features

- Results directly in Raycast
- Search suggestions while you type
- History of your searches
- Filter the current result set without a new Brave query
- AI page summaries (Jina Reader + Raycast AI)
- Copy results as markdown links

# Shortcuts (web results)

| Shortcut | Action |
| --- | --- |
| `↵` | Open the result in the browser |
| `⌘F` | Filter current results (title, snippet, URL). `⌘F` again restores them |
| `⌘⇧S` | Summarize the page |
| `⌘⇧L` | Copy a markdown link (`[title](url)`) |
| `⌘C` | Copy URL |
| `⌘⇧C` | Copy title |

Summarize and Copy Markdown Link are also available from the summary view. Summarize uses [Raycast AI](https://www.raycast.com/core-features/ai) (Pro / trial messages).

# Setup

The extension uses the [Brave APIs](https://brave.com/search/api/) to get search suggestions and results. To use the extension, you need to get **two APIs keys** from Brave:

1. **Suggest API Key**: This key is used to get search suggestions while you type. You can create this key by adding [a new key](https://api.search.brave.com/app/keys) and choosing "Subscription: Free Autosuggest _or_ Autosuggest". Make sure to [subscribe](https://api.search.brave.com/app/subscriptions/subscribe) to a (free or paid) "Suggest" plan.
2. **Data for Search API Key**: This key is used to get search results. You can create this key by adding [a new key](https://api.search.brave.com/app/keys) and choosing "Subscription: Free _or_ Base _or_ Pro". Make sure to [subscribe](https://api.search.brave.com/app/subscriptions/subscribe) to a (free or paid) "Data for Search" plan.
