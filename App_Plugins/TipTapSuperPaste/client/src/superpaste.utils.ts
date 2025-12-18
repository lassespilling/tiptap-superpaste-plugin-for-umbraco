// Regex to remove invisible/control characters from text
const INVISIBLE_CHARS_REGEX =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

export function cleanText(input: string): string {
    return input
        .replace(/\u00A0/g, ' ') // nbsp -> space
        .replace(INVISIBLE_CHARS_REGEX, '')
        .trim();
}

function cleanWordCruft(html: string): string {
    let str = html;

    // Remove Office namespace tags
    str = str.replace(/<o:p>\s*<\/o:p>/gi, '');
    str = str.replace(/<o:p>.*?<\/o:p>/gi, ' ');
    str = str.replace(/<\/?\w+:[^>]*>/gi, ''); // Remove all namespace tags like <o:p>, <w:sdt>, etc.
    str = str.replace(/<\\?\?xml[^>]*>/gi, '');

    // Remove mso-* styles
    str = str.replace(/\s*mso-[^:]+:[^;"]+;?/gi, '');

    // Remove specific Word styles
    str = str.replace(/\s*MARGIN:\s*0cm 0cm 0pt\s*;?/gi, '');
    str = str.replace(/\s*TEXT-INDENT:\s*[^;]+;?/gi, '');
    str = str.replace(/\s*TEXT-ALIGN:\s*[^;]+;?/gi, '');
    str = str.replace(/\s*PAGE-BREAK-BEFORE:\s*[^;]+;?/gi, '');
    str = str.replace(/\s*FONT-VARIANT:\s*[^;]+;?/gi, '');
    str = str.replace(/\s*tab-stops:[^;"]*;?/gi, '');
    str = str.replace(/\s*FONT-FAMILY:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*font-family:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*FONT-SIZE:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*font-size:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*line-height:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*color:\s*[^;"]*;?/gi, '');
    str = str.replace(/\s*background[^:]*:\s*[^;"]*;?/gi, '');

    // Remove face attribute
    str = str.replace(/\s*face="[^"]*"/gi, '');
    str = str.replace(/\s*face=[^ >]*/gi, '');

    // Remove lang attribute
    str = str.replace(/\s*lang="[^"]*"/gi, '');
    str = str.replace(/\s*lang=[^ >]*/gi, '');

    // Remove empty style attributes
    str = str.replace(/\s*style="\s*"/gi, '');
    str = str.replace(/\s*style=''/gi, '');

    // Remove empty spans
    str = str.replace(/<span\s*[^>]*>\s*<\/span>/gi, '');
    str = str.replace(/<span\s*>\s*<\/span>/gi, '');

    // Unwrap simple spans (no attributes)
    str = str.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');

    // Remove font tags but keep content
    str = str.replace(/<\/?font[^>]*>/gi, '');

    // Remove style and script blocks
    str = str.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    str = str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove HTML comments
    str = str.replace(/<!--[\s\S]*?-->/gi, '');

    // Remove meta and link tags
    str = str.replace(/<meta[^>]*>/gi, '');
    str = str.replace(/<link[^>]*>/gi, '');

    return str;
}

function isListParagraph(el: Element): boolean {
    const className = el.className || '';
    return className.includes('MsoListParagraph') || className.includes('MsoListParagraphCxSp');
}

function isNumberedList(text: string): boolean {
    return /^\s*\d+[\.\)]\s/.test(text);
}

function stripBulletMarkers(html: string): string {
    // Remove bullet characters and numbered list markers from the start
    return html
        .replace(/^[\s·•●○■□▪▫–\-]+\s*/g, '')
        .replace(/^\s*\d+[\.\)]\s*/g, '')
        .trim();
}

function cleanElementAttributes(el: Element): void {
    // Remove class and most style attributes, but element stays
    el.removeAttribute('class');
    el.removeAttribute('style');
    el.removeAttribute('lang');
    el.removeAttribute('face');
}

function processElement(el: Element): string {
    const tagName = el.tagName.toLowerCase();

    // Handle formatting tags - keep them but clean attributes
    if (['strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup'].includes(tagName)) {
        cleanElementAttributes(el);
        const inner = processChildren(el);
        if (!inner.trim()) return '';
        return `<${tagName}>${inner}</${tagName}>`;
    }

    // Remove spans, keep content
    if (tagName === 'span') {
        return processChildren(el);
    }

    // For other elements, just process children
    return processChildren(el);
}

function processChildren(el: Element): string {
    let result = '';
    for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            result += processElement(node as Element);
        }
    }
    return result;
}

export function cleanWordHtml(html: string): string {
    // Step 1: Regex cleanup of Word cruft
    let cleanedHtml = cleanWordCruft(html);

    // Step 2: Parse and process with DOM
    const container = document.createElement('div');
    container.innerHTML = cleanedHtml;

    // Handle full HTML documents - extract body content
    let contentContainer: Element = container;
    const bodyElement = container.querySelector('body');
    if (bodyElement) {
        contentContainer = bodyElement;
    }

    // Process all children in order to properly group lists
    const result: string[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
        if (currentList && currentList.items.length > 0) {
            const tag = currentList.type;
            const items = currentList.items.map(item => `<li>${item}</li>`).join('');
            result.push(`<${tag}>${items}</${tag}>`);
            currentList = null;
        }
    };

    for (const child of Array.from(contentContainer.children)) {
        const tagName = child.tagName.toLowerCase();

        if (tagName === 'p') {
            if (isListParagraph(child)) {
                const rawText = child.textContent || '';
                const isNumbered = isNumberedList(rawText);
                const listType = isNumbered ? 'ol' : 'ul';

                // Flush if list type changes
                if (currentList && currentList.type !== listType) {
                    flushList();
                }

                if (!currentList) {
                    currentList = { type: listType, items: [] };
                }

                // Process the content, preserving formatting
                let itemHtml = processChildren(child);
                itemHtml = stripBulletMarkers(itemHtml);
                itemHtml = cleanText(itemHtml);

                if (itemHtml) {
                    currentList.items.push(itemHtml);
                }
            } else {
                // Regular paragraph - flush list first
                flushList();

                let content = processChildren(child);
                content = cleanText(content);

                if (content) {
                    result.push(`<p>${content}</p>`);
                }
            }
        } else if (['ul', 'ol'].includes(tagName)) {
            // Already a list - flush current and add
            flushList();
            cleanElementAttributes(child);
            child.querySelectorAll('li').forEach(li => {
                cleanElementAttributes(li);
            });
            result.push(child.outerHTML);
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            flushList();
            let content = processChildren(child);
            content = cleanText(content);
            if (content) {
                result.push(`<${tagName}>${content}</${tagName}>`);
            }
        } else {
            // Other elements
            flushList();
            const content = processChildren(child);
            if (content.trim()) {
                result.push(`<p>${cleanText(content)}</p>`);
            }
        }
    }

    // Flush any remaining list
    flushList();

    return result.join('');
}
