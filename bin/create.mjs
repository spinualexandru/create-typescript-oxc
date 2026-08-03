#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { argv, cwd, exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

const TEMPLATE_FILES = [
  "oxfmt.config.ts",
  "oxlint.config.ts",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "tsconfig.test.json",
];

const TEMPLATE_DIRS = ["src", "tests"];

// npm drops a `.gitignore` from published tarballs, so the template ships its
// copy as `_gitignore` and it is renamed back here. `.gitignore` is the local
// checkout (running the bin straight from a clone).
const GITIGNORE_SOURCES = ["_gitignore", ".gitignore"];

// Scripts that only make sense for publishing the template itself.
const OMITTED_SCRIPTS = new Set(["prepack"]);

const VALID_PACKAGE_NAME =
  /^(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/;

async function ask(question, fallback) {
  if (!stdin.isTTY) return fallback;
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(`${question} (${fallback}) `);
    return answer.trim() || fallback;
  } finally {
    rl.close();
  }
}

function toPackageName(raw) {
  const name = raw
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^[._-]+/, "")
    .replace(/-+$/, "");
  return VALID_PACKAGE_NAME.test(name) ? name : "my-app";
}

function copyGitignore(target) {
  for (const source of GITIGNORE_SOURCES) {
    const path = join(packageRoot, source);
    if (existsSync(path)) {
      cpSync(path, join(target, ".gitignore"));
      return;
    }
  }
}

function writePackageJson(target, name) {
  const template = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8"),
  );
  const scripts = Object.fromEntries(
    Object.entries(template.scripts).filter(
      ([key]) => !OMITTED_SCRIPTS.has(key),
    ),
  );

  // Key order matches what `oxfmt` enforces for a package.json, so a freshly
  // scaffolded project passes `pnpm fmt:check` without being reformatted.
  const pkg = {
    name,
    version: "0.0.0",
    private: true,
    description: "",
    license: "MIT",
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    // Subpath imports carry the `#*` alias. Reused rather than restated so the
    // scaffolded mapping cannot drift from the template's own.
    imports: template.imports,
    scripts,
    devDependencies: template.devDependencies,
    devEngines: template.devEngines,
    engines: template.engines,
  };

  writeFileSync(
    join(target, "package.json"),
    `${JSON.stringify(pkg, undefined, 2)}\n`,
  );
}

function writeReadme(target, name) {
  const readme = `# ${name}

Scaffolded with [create-typescript-oxc](https://github.com/spinualexandru/create-typescript-oxc).

## Commands

\`\`\`
pnpm dev          # tsx watch src/index.ts
pnpm build        # tsc -> dist/
pnpm start        # node dist/index.js
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest (with test typechecking)
pnpm lint         # oxlint (type-aware)
pnpm lint:fix
pnpm fmt          # oxfmt
pnpm fmt:check
\`\`\`

Source lives in \`src/\`, tests in \`tests/\`.

Internal modules are imported through the \`#*\` subpath alias declared in
\`package.json\` — \`import { greet } from "#lib/greet.js"\` resolves to
\`src/lib/greet.ts\`, and to \`dist/lib/greet.js\` in the built output. Note the
\`.js\` extension: it is required under \`module: NodeNext\` even from a \`.ts\`
source.
`;
  writeFileSync(join(target, "README.md"), readme);
}

async function main() {
  const requested = argv[2] ?? (await ask("Project directory:", "my-app"));
  const target = resolve(cwd(), requested);

  if (existsSync(target) && readdirSync(target).length > 0) {
    stdout.write(`error: ${target} already exists and is not empty\n`);
    exit(1);
  }

  mkdirSync(target, { recursive: true });

  for (const dir of TEMPLATE_DIRS) {
    const source = join(packageRoot, dir);
    if (existsSync(source)) {
      cpSync(source, join(target, dir), { recursive: true });
    }
  }
  for (const file of TEMPLATE_FILES) {
    cpSync(join(packageRoot, file), join(target, file));
  }
  copyGitignore(target);

  const name = toPackageName(basename(target));
  writePackageJson(target, name);
  writeReadme(target, name);

  const relative = requested === "." ? "" : `cd ${requested}\n  `;
  stdout.write(
    `\nCreated ${name} in ${target}\n\nNext steps:\n  ${relative}pnpm install\n  pnpm dev\n\n`,
  );
}

await main();
