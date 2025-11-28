// ==============================
// 🧩 Script: generate-project-structure.js
// ==============================
//
// Este script recorre todo tu proyecto y genera dos archivos:
//
// 1️⃣ project-structure.json → Estructura completa en formato JSON
// 2️⃣ project-structure.md   → Estructura visual tipo árbol
//
// Ignora automáticamente carpetas: node_modules, .next, dist, public
//
// Ejecución:
//    node generate-project-structure.js
//
// ==============================

import fs from "fs";
import path from "path";

// 🧠 Carpetas a ignorar
const IGNORE_DIRS = ["node_modules", ".next", "dist", "public", ".git", ".vscode", "(others-pages)"];

// 🚀 Función recursiva que construye el árbol
function getTree(dir) {
  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) return null;

  const files = fs.readdirSync(dir).filter((f) => !IGNORE_DIRS.includes(f));

  return files.map((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return { name: file, type: "directory", children: getTree(fullPath) };
    }
    return { name: file, type: "file" };
  });
}

// 🌳 Función para convertir JSON → árbol Markdown legible
function jsonToMarkdown(tree, prefix = "") {
  let output = "";
  for (const node of tree) {
    const isLast = tree.indexOf(node) === tree.length - 1;
    const connector = isLast ? "└── " : "├── ";
    output += `${prefix}${connector}${node.name}\n`;
    if (node.children) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      output += jsonToMarkdown(node.children, newPrefix);
    }
  }
  return output;
}

// 🏗️ Construir estructura desde la raíz
const projectName = path.basename(process.cwd());
const tree = [{ name: projectName, type: "directory", children: getTree(".") }];

// 📦 Guardar JSON
fs.writeFileSync("project-structure.json", JSON.stringify(tree, null, 2));

// 📝 Guardar Markdown
const markdownTree = jsonToMarkdown(tree);
fs.writeFileSync("project-structure.md", markdownTree);
