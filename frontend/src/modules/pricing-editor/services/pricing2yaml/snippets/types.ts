/** Top-level maps of a Pricing2Yaml document that can host a snippet. */
export type SnippetSection = 'features' | 'usageLimits' | 'plans' | 'addOns';

/**
 * Canonical order of the top-level sections, used to place a section the
 * document does not declare yet where a reader would expect to find it.
 */
export const SECTION_ORDER: readonly SnippetSection[] = [
  'features',
  'usageLimits',
  'plans',
  'addOns',
];

export type SnippetKind = 'block' | 'document';

/**
 * A shortcut, expressed as the letter that completes the `Ctrl/Cmd + K` chord.
 *
 * A chord is used rather than `Ctrl + Alt + <letter>` because the latter is
 * AltGr on Windows layouts, where it types characters (AltGr + E is `€` on a
 * Spanish keyboard) instead of triggering the command.
 */
export interface SnippetShortcut {
  /** Uppercase letter pressed after the chord prefix. */
  key: string;
}

/**
 * A ready-made piece of Pricing2Yaml.
 *
 * `block` snippets describe one entry of a section (a feature, a plan, ...) and
 * are placed inside that section. `document` snippets are whole pricings and
 * replace the editor contents.
 *
 * Bodies are written in Monaco snippet syntax (`${1:placeholder}`,
 * `${1|a,b|}`), with no leading indentation: the insertion logic indents them
 * to match the section they land in.
 */
export interface Pricing2YamlSnippet {
  id: string;
  /** Title shown in the templates menu. */
  label: string;
  /** What the user types in the editor to pull the snippet in. */
  prefix: string;
  /** One-liner shown next to the label. */
  detail: string;
  documentation: string;
  kind: SnippetKind;
  /** Required for `block` snippets, ignored for `document` ones. */
  section?: SnippetSection;
  /** Snippet body, or a factory when it depends on the current date. */
  body: string | (() => string);
  shortcut?: SnippetShortcut;
}

/** Resolves the body of snippets whose contents depend on the moment of use. */
export function resolveSnippetBody(snippet: Pricing2YamlSnippet): string {
  return typeof snippet.body === 'function' ? snippet.body() : snippet.body;
}
