const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src", "renderer");
const dest = path.join(root, "dist", "renderer");

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

fs.readdirSync(src).forEach((file) => {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
});
