import type { Monaco } from '@monaco-editor/react';
import type monaco from 'monaco-editor';
import { useCallback, useEffect } from 'react';

import {
  insertSnippet,
  registerSnippetActions,
  registerSnippetCompletions,
  type Pricing2YamlSnippet,
} from '../services/pricing2yaml/snippets';

/**
 * Makes the Pricing2Yaml templates reachable from the editor: as YAML
 * completions, as commands with their keyboard shortcut, and as a callback for
 * the templates menu.
 */
export function usePricing2YamlSnippets(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  monacoInstance: Monaco | null,
  snippets: readonly Pricing2YamlSnippet[]
): (snippet: Pricing2YamlSnippet) => void {
  useEffect(() => {
    if (!monacoInstance) {
      return;
    }

    const disposable = registerSnippetCompletions(monacoInstance, snippets);

    // Registration is global to the language, so it has to be undone on unmount
    // or every remount would add another copy of every suggestion.
    return () => disposable.dispose();
  }, [monacoInstance, snippets]);

  useEffect(() => {
    if (!editor || !monacoInstance) {
      return;
    }

    const disposables = registerSnippetActions(editor, monacoInstance, snippets);

    return () => disposables.forEach(disposable => disposable.dispose());
  }, [editor, monacoInstance, snippets]);

  return useCallback(
    (snippet: Pricing2YamlSnippet) => {
      if (editor) {
        insertSnippet(editor, snippet);
      }
    },
    [editor]
  );
}
