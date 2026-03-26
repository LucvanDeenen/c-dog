import {
  mdiCodeBraces,
  mdiMicrosoftVisualStudioCode, mdiCursorDefault, mdiLanguageJavascript,
  mdiLanguageCsharp, mdiLanguageJava, mdiLanguageGo, mdiLanguagePython,
  mdiNoteText, mdiBolt,
} from "@mdi/js";

export interface EditorInfo { id: string; name: string }

export const EDITOR_ICONS: Record<string, string> = {
  vscode:   mdiMicrosoftVisualStudioCode,
  cursor:   mdiCursorDefault,
  webstorm: mdiLanguageJavascript,
  rider:    mdiLanguageCsharp,
  idea:     mdiLanguageJava,
  goland:   mdiLanguageGo,
  pycharm:  mdiLanguagePython,
  sublime:  mdiNoteText,
  zed:      mdiBolt,
};

export function editorIcon(id: string): string {
  return EDITOR_ICONS[id] ?? mdiCodeBraces;
}
