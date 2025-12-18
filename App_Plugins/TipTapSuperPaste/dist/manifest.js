const t = [
  // Extension for the toolbar button (manual clean paste via button click)
  {
    type: "tiptapExtension",
    alias: "My.Tiptap.SuperPasteButton",
    name: "Super Paste Button Extension",
    api: () => import("./superpaste.tiptap-api-BlaSze4B.js"),
    meta: {
      icon: "icon-paste-in",
      label: "Super Paste Button",
      group: "Custom"
    }
  },
  // Toolbar button for manual clean paste
  {
    type: "tiptapToolbarExtension",
    kind: "button",
    alias: "My.Tiptap.Toolbar.SuperPaste",
    name: "Super Paste Toolbar Button",
    api: () => import("./superpaste.tiptap-toolbar-api-BtcHmvsj.js"),
    forExtensions: ["My.Tiptap.SuperPasteButton"],
    meta: {
      alias: "superpastebutton",
      icon: "icon-paste-in",
      label: "Super Paste"
    }
  },
  // Extension for automatic clean paste on Ctrl+V / Cmd+V
  {
    type: "tiptapExtension",
    alias: "My.Tiptap.SuperPaste",
    name: "Super Paste Extension",
    api: () => import("./superpaste.tiptap-paste-api-BMSlM-Rw.js"),
    meta: {
      icon: "icon-paste-in",
      label: "Super Paste",
      group: "Custom"
    }
  }
];
export {
  t as manifests
};
//# sourceMappingURL=manifest.js.map
