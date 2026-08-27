const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

const decodeEntity = (match: string, body: string): string => {
  if (body.startsWith("#x") || body.startsWith("#X")) {
    const code = parseInt(body.slice(2), 16);
    return Number.isNaN(code) ? match : String.fromCodePoint(code);
  }

  if (body.startsWith("#")) {
    const code = parseInt(body.slice(1), 10);
    return Number.isNaN(code) ? match : String.fromCodePoint(code);
  }

  return NAMED_ENTITIES[body.toLowerCase()] ?? match;
};

export default function cleanHtml(input: string): string {
  if (!input) return "";

  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, decodeEntity)
    .replace(/\s+/g, " ")
    .trim();
}
