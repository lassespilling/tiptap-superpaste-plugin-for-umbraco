import { UmbTiptapExtensionApiBase } from '@umbraco-cms/backoffice/tiptap';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { cleanWordHtml, cleanText } from './superpaste.utils';

// Async paste handler using the same approach as the button
async function handleSuperPaste(editor: any): Promise<boolean> {
    try {
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
            // Try to get HTML first (for Word content)
            if (item.types.includes('text/html')) {
                const blob = await item.getType('text/html');
                const html = await blob.text();

                if (html) {
                    const cleanedHtml = cleanWordHtml(html);
                    editor.chain().focus().insertContent(cleanedHtml).run();
                    return true;
                }
            }

            // Fall back to plain text
            if (item.types.includes('text/plain')) {
                const blob = await item.getType('text/plain');
                const text = await blob.text();

                if (text) {
                    const cleanedText = cleanText(text);
                    editor.chain().focus().insertContent(cleanedText).run();
                    return true;
                }
            }
        }
    } catch (err) {
        console.warn('Super Paste: Could not read clipboard', err);
    }
    return false;
}

// Create a TipTap extension that intercepts paste events
const SuperPasteExtension = Extension.create({
    name: 'cleanPaste',

    addProseMirrorPlugins() {
        const editorInstance = this.editor;

        return [
            new Plugin({
                key: new PluginKey('cleanPaste'),
                props: {
                    handlePaste: (_view, event, _slice) => {
                        // Prevent default and handle async
                        event.preventDefault();

                        // Use the same approach as the button
                        handleSuperPaste(editorInstance);

                        return true;
                    },
                },
            }),
        ];
    },
});

// This extension adds the clean paste handling for Ctrl+V / Cmd+V
export default class UmbTiptapSuperPasteExtensionApi extends UmbTiptapExtensionApiBase {
    getTiptapExtensions = () => [SuperPasteExtension];
}
