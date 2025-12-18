import { UmbTiptapExtensionApiBase } from '@umbraco-cms/backoffice/tiptap';

// Re-export utils for backwards compatibility with toolbar button
export { cleanText, cleanWordHtml } from './superpaste.utils';

// This extension doesn't add any TipTap extensions - it's just a capability marker for the toolbar button
export default class UmbTiptapSuperPasteToolbarExtensionApi extends UmbTiptapExtensionApiBase {
    getTiptapExtensions = () => [];
}
