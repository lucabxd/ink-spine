// Runs on every Netlify build. Reads src/index.html (which has placeholders instead of real
// credentials) and writes dist/index.html with the real Supabase URL and anon key filled in,
// taken from environment variables set in the Netlify dashboard - never committed to git.
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing SUPABASE_URL and/or SUPABASE_ANON_KEY.\n" +
    "Set them under Site settings -> Environment variables in Netlify, " +
    "or export them in your shell before building locally."
  );
  process.exit(1);
}

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");
fs.mkdirSync(distDir, { recursive: true });

let html = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");

function replaceOnce(str, needle, value) {
  const count = str.split(needle).length - 1;
  if (count !== 1) {
    throw new Error("Expected exactly one occurrence of " + needle + " in index.html, found " + count + ".");
  }
  return str.split(needle).join(value);
}

html = replaceOnce(html, "__SUPABASE_URL__", SUPABASE_URL);
html = replaceOnce(html, "__SUPABASE_ANON_KEY__", SUPABASE_ANON_KEY);

fs.writeFileSync(path.join(distDir, "index.html"), html);
fs.copyFileSync(path.join(srcDir, "_headers"), path.join(distDir, "_headers"));

console.log("Built dist/index.html and dist/_headers with Supabase credentials injected.");
