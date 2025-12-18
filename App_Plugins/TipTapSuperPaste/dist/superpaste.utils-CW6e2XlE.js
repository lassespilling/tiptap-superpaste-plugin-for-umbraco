const E = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
function p(s) {
  return s.replace(/\u00A0/g, " ").replace(E, "").trim();
}
function h(s) {
  let e = s;
  return e = e.replace(/<o:p>\s*<\/o:p>/gi, ""), e = e.replace(/<o:p>.*?<\/o:p>/gi, " "), e = e.replace(/<\/?\w+:[^>]*>/gi, ""), e = e.replace(/<\\?\?xml[^>]*>/gi, ""), e = e.replace(/\s*mso-[^:]+:[^;"]+;?/gi, ""), e = e.replace(/\s*MARGIN:\s*0cm 0cm 0pt\s*;?/gi, ""), e = e.replace(/\s*TEXT-INDENT:\s*[^;]+;?/gi, ""), e = e.replace(/\s*TEXT-ALIGN:\s*[^;]+;?/gi, ""), e = e.replace(/\s*PAGE-BREAK-BEFORE:\s*[^;]+;?/gi, ""), e = e.replace(/\s*FONT-VARIANT:\s*[^;]+;?/gi, ""), e = e.replace(/\s*tab-stops:[^;"]*;?/gi, ""), e = e.replace(/\s*FONT-FAMILY:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*font-family:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*FONT-SIZE:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*font-size:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*line-height:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*color:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*background[^:]*:\s*[^;"]*;?/gi, ""), e = e.replace(/\s*face="[^"]*"/gi, ""), e = e.replace(/\s*face=[^ >]*/gi, ""), e = e.replace(/\s*lang="[^"]*"/gi, ""), e = e.replace(/\s*lang=[^ >]*/gi, ""), e = e.replace(/\s*style="\s*"/gi, ""), e = e.replace(/\s*style=''/gi, ""), e = e.replace(/<span\s*[^>]*>\s*<\/span>/gi, ""), e = e.replace(/<span\s*>\s*<\/span>/gi, ""), e = e.replace(/<span\s*>([\s\S]*?)<\/span>/gi, "$1"), e = e.replace(/<\/?font[^>]*>/gi, ""), e = e.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ""), e = e.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ""), e = e.replace(/<!--[\s\S]*?-->/gi, ""), e = e.replace(/<meta[^>]*>/gi, ""), e = e.replace(/<link[^>]*>/gi, ""), e;
}
function N(s) {
  const e = s.className || "";
  return e.includes("MsoListParagraph") || e.includes("MsoListParagraphCxSp");
}
function A(s) {
  return /^\s*\d+[\.\)]\s/.test(s);
}
function T(s) {
  return s.replace(/^[\s·•●○■□▪▫–\-]+\s*/g, "").replace(/^\s*\d+[\.\)]\s*/g, "").trim();
}
function g(s) {
  s.removeAttribute("class"), s.removeAttribute("style"), s.removeAttribute("lang"), s.removeAttribute("face");
}
function y(s) {
  const e = s.tagName.toLowerCase();
  if (["strong", "b", "em", "i", "u", "s", "strike", "sub", "sup"].includes(e)) {
    g(s);
    const i = l(s);
    return i.trim() ? `<${e}>${i}</${e}>` : "";
  }
  return l(s);
}
function l(s) {
  let e = "";
  for (const i of Array.from(s.childNodes))
    i.nodeType === Node.TEXT_NODE ? e += i.textContent || "" : i.nodeType === Node.ELEMENT_NODE && (e += y(i));
  return e;
}
function b(s) {
  let e = h(s);
  const i = document.createElement("div");
  i.innerHTML = e;
  let f = i;
  const m = i.querySelector("body");
  m && (f = m);
  const a = [];
  let n = null;
  const o = () => {
    if (n && n.items.length > 0) {
      const r = n.type, c = n.items.map((t) => `<li>${t}</li>`).join("");
      a.push(`<${r}>${c}</${r}>`), n = null;
    }
  };
  for (const r of Array.from(f.children)) {
    const c = r.tagName.toLowerCase();
    if (c === "p")
      if (N(r)) {
        const t = r.textContent || "", d = A(t) ? "ol" : "ul";
        n && n.type !== d && o(), n || (n = { type: d, items: [] });
        let u = l(r);
        u = T(u), u = p(u), u && n.items.push(u);
      } else {
        o();
        let t = l(r);
        t = p(t), t && a.push(`<p>${t}</p>`);
      }
    else if (["ul", "ol"].includes(c))
      o(), g(r), r.querySelectorAll("li").forEach((t) => {
        g(t);
      }), a.push(r.outerHTML);
    else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(c)) {
      o();
      let t = l(r);
      t = p(t), t && a.push(`<${c}>${t}</${c}>`);
    } else {
      o();
      const t = l(r);
      t.trim() && a.push(`<p>${p(t)}</p>`);
    }
  }
  return o(), a.join("");
}
export {
  b as a,
  p as c
};
//# sourceMappingURL=superpaste.utils-CW6e2XlE.js.map
