import * as vscode from 'vscode';
import { getSettings } from './extension';

const commands = [
    
    // Command for adding color comments {#454,37}
    vscode.commands.registerCommand("color-blocks.add", () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;
        const doc = activeEditor.document;

        // Process selections bottom-up so earlier insertions do not shift the
        // line numbers of selections that have not been handled yet.
        const selections = [...activeEditor.selections].sort((a, b) => b.start.line - a.start.line);

        for (const selection of selections) {
            const firstLine = Math.min(selection.end.line, selection.start.line);
            const lastLine = Math.max(selection.end.line, selection.start.line);

            // Give both markers the same random color so the block is a single hue.
            const color = Math.floor(Math.random() * 0x1000)
                .toString(16)
                .padStart(3, '0');

            const startIndent = doc.lineAt(firstLine).text.match(/^\s*/)![0];
            const endIndent = doc.lineAt(lastLine).text.match(/^\s*/)![0];
            const lastLineEnd = doc.lineAt(lastLine).range.end;

            // End marker on a new line after the last selected line.
            activeEditor.insertSnippet(
                new vscode.SnippetString(`\n${endIndent}$LINE_COMMENT {#${color}, end}`),
                lastLineEnd,
                { undoStopBefore: false, undoStopAfter: false }
            );

            // Start marker on a new line before the first selected line.
            activeEditor.insertSnippet(
                new vscode.SnippetString(`${startIndent}$LINE_COMMENT {#${color}, start}\n`),
                new vscode.Position(firstLine, 0),
                { undoStopBefore: false, undoStopAfter: false }
            );
        }
    }),

    // Command for showing or hiding color blocks {#454,4}
    vscode.commands.registerCommand("color-blocks.toggle", () => {
        const settings = getSettings();
        settings.update("behavior.enabled", !settings.behavior.enabled);
    }),

    // Command for toggling automatic line-count updates {#454,5}
    vscode.commands.registerCommand("color-blocks.toggleAutoUpdate", () => {
        const settings = getSettings();
        const next = !settings.behavior.autoUpdate;
        settings.update("behavior.autoUpdate", next);
        vscode.window.setStatusBarMessage(`Color Blocks auto-update ${next ? "enabled" : "disabled"}.`, 3000);
    })

];

export default commands;