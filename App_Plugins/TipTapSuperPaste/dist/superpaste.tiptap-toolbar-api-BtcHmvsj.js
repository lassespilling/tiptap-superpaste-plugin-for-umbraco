import { UmbTiptapToolbarElementApiBase as s } from "@umbraco-cms/backoffice/tiptap";
import { a as c, c as i } from "./superpaste.utils-CW6e2XlE.js";
class m extends s {
  async execute(a) {
    if (a)
      try {
        const n = await navigator.clipboard.read();
        for (const e of n) {
          if (e.types.includes("text/html")) {
            const t = await (await e.getType("text/html")).text();
            if (t) {
              const o = c(t);
              a.chain().focus().insertContent(o).run();
              return;
            }
          }
          if (e.types.includes("text/plain")) {
            const t = await (await e.getType("text/plain")).text();
            if (t) {
              const o = i(t);
              a.chain().focus().insertContent(o).run();
              return;
            }
          }
        }
      } catch (n) {
        console.warn("Super Paste: Could not read clipboard", n);
      }
  }
}
export {
  m as default
};
//# sourceMappingURL=superpaste.tiptap-toolbar-api-BtcHmvsj.js.map
