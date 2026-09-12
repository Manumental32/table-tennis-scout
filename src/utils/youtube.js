export function buildYoutubeSearchUrl(rivalName) {
  const query = `${rivalName} tenis de mesa`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
