/* eslint-disable eqeqeq, @typescript-eslint/strict-boolean-expressions */
import { Prec, Extension, EditorState } from '@codemirror/state';
import { keymap, KeyBinding } from '@codemirror/view';
import { CompletionConfig, completionConfig } from './config';
import { State, completionState } from './state';
import { baseTheme } from './theme';
import { defaultCompletionTooltip } from './tooltip';
import { completionPlugin, moveCompletionSelection, acceptCompletion, startCompletion, closeCompletion } from './view';

export { CompletionContext, Completion, CompletionResult, CompletionSource, applyCompletion, Option, insertCompletionText } from './completion';
export { snippet } from './snippet';
export { CompletionState } from './state';
export { completionTooltip } from './tooltip';
export { closeCompletion, startCompletion } from './view';
export { closeBrackets } from './closebrackets';

/// Returns an extension that enables autocompletion.
export function autocompletion(config: CompletionConfig = {}): Extension {
  return [
    defaultCompletionTooltip,
    completionState,
    completionConfig.of(config),
    completionPlugin,
    completionKeymapExt,
    baseTheme,
  ];
}

/// Basic keybindings for autocompletion.
///
///  - Ctrl-Space: [`startCompletion`](#autocomplete.startCompletion)
///  - Escape: [`closeCompletion`](#autocomplete.closeCompletion)
///  - ArrowDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true)`
///  - ArrowUp: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(false)`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - PageDown: [`moveCompletionSelection`](#autocomplete.moveCompletionSelection)`(true, "page")`
///  - Enter: [`acceptCompletion`](#autocomplete.acceptCompletion)
export const completionKeymap: readonly KeyBinding[] = [
  { key: 'Ctrl-Space', run: startCompletion },
  { key: 'Escape', run: closeCompletion },
  { key: 'ArrowDown', run: moveCompletionSelection(true) },
  { key: 'ArrowUp', run: moveCompletionSelection(false) },
  { key: 'PageDown', run: moveCompletionSelection(true, 'page') },
  { key: 'PageUp', run: moveCompletionSelection(false, 'page') },
  { key: 'Enter', run: acceptCompletion },
  { key: 'Tab', run: acceptCompletion },
];

const completionKeymapExt = Prec.highest(
  keymap.computeN([completionConfig], (state) =>
    state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []
  )
);

/// Get the current completion status. When completions are available,
/// this will return `"active"`. When completions are pending (in the
/// process of being queried), this returns `"pending"`. Otherwise, it
/// returns `null`.
export function completionStatus(state: EditorState): null | 'active' | 'pending' {
  const cState = state.field(completionState, false);
  return cState && cState.active.some((a) => a.state == State.Pending)
    ? 'pending'
    : cState && cState.active.some((a) => a.state != State.Inactive)
      ? 'active'
      : null;
}
