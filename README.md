# create-typescript-oxc

A minimal TypeScript starter built on the [oxc](https://oxc.rs) toolchain —
`oxlint` and `oxfmt` instead of eslint and prettier, TypeScript 7 (the native
compiler), pnpm, vitest, ESM only.

## Usage

```sh
pnpm create typescript-oxc my-app
cd my-app
pnpm install
pnpm dev
```

`npm create typescript-oxc@latest my-app` and
`yarn create typescript-oxc my-app` work too. Omit the directory argument and
you will be prompted for one.

## What you get

```
my-app/
├── src/index.ts
├── src/lib/greet.ts
├── tests/greet.test.ts
├── oxlint.config.ts
├── oxfmt.config.ts
├── pnpm-workspace.yaml
├── tsconfig.json
├── tsconfig.test.json
└── package.json
```

### Commands

```
pnpm dev          # tsx watch --conditions=development src/index.ts
pnpm build        # tsc -> dist/
pnpm start        # node dist/index.js
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run --typecheck --typecheck.tsconfig tsconfig.test.json
pnpm lint         # oxlint (type-aware)
pnpm lint:fix
pnpm fmt          # oxfmt
pnpm fmt:check
```

### Toolchain

- **oxc, not eslint/prettier.** Lint is `oxlint` with `typeAware: true` +
  `typeCheck: true` (via `oxlint-tsgolint`), plugins `typescript` / `unicorn` /
  `oxc` / `node`, `maxWarnings: 10`. Format is `oxfmt` at `printWidth: 80`.
- **TypeScript 7** (pinned exact) — the native/Go compiler. `oxlint-tsgolint`
  versions track the TS release they embed (`7.0.2001` → TS 7.0.2), and
  `oxlint` peer-requires a matching one, so bump TypeScript, tsgolint and
  oxlint together.
- **Strict ESM.** `target: ES2024`, `module: NodeNext`,
  `verbatimModuleSyntax: true` (type-only imports must be written
  `import type`), relative imports need explicit `.js` extensions.
- **Path aliases use Node subpath imports, not `tsconfig.paths`.** The `#*`
  mapping lives in `package.json`, so `import { greet } from "#lib/greet.js"`
  resolves to `src/lib/greet.ts` while typechecking and to `dist/lib/greet.js`
  at runtime:

  ```json
  "imports": {
    "#*": {
      "types": "./src/*",
      "development": "./src/*",
      "default": "./dist/*"
    }
  }
  ```

  This is deliberate. `tsc` does _not_ rewrite import specifiers, so a
  `tsconfig.paths` alias typechecks cleanly and then emits `import "@/lib/x.js"`
  verbatim into `dist/`, where Node throws `ERR_MODULE_NOT_FOUND`. Aliases would
  need a bundler or `tsc-alias` to survive a build. Subpath imports are resolved
  natively by Node, tsx, vitest and TypeScript, with a single declaration and no
  extra dependency.

  The `development` condition is what points dev and test runs at `src/`. tsx
  needs it passed explicitly (`--conditions=development`, already in the `dev`
  script) — without it, tsx resolves through `default` and silently runs stale
  `dist/` output. Vitest applies the condition on its own, so it needs no
  config.

- **Test typechecking is part of `pnpm test`.** `tsconfig.test.json` widens
  `rootDir` to `.` and includes `src` and `tests`, so tests live in a top-level
  `tests/` directory rather than colocated.

## Developing this template

The repository root _is_ the template. `bin/create.mjs` copies `src/`,
`tests/`, the tsconfigs and the oxc configs into the target directory, then
generates a fresh `package.json` (reusing this package's `scripts`, `imports`,
`devDependencies` and `devEngines`) and a `README.md`.

Three things to know:

- **`_gitignore` is the template's ignore file.** npm drops a `.gitignore` from
  published tarballs, so the template ships it under an underscore and the
  scaffolder renames it back. Keep it in sync with the repository's own
  `.gitignore`.
- **`files` is an allowlist.** Anything new that should reach scaffolded
  projects needs an entry in `files` _and_ in `TEMPLATE_FILES` /
  `TEMPLATE_DIRS` in `bin/create.mjs`.
- **`src/lib/greet.ts` and `tests/greet.test.ts` are not filler.** They are the
  only things importing through `#`, so they are what would catch the alias
  breaking. Keep an import through `#` if you replace them.

Verify a release candidate before publishing:

```sh
pnpm pack --pack-destination /tmp   # runs `prepack` (tsc), check the contents
node bin/create.mjs /tmp/scaffold-check
```

Use `pnpm pack`, not `npm pack` — npm rejects this package's
`devEngines.packageManager` with `EBADDEVENGINES`. That check only applies to
commands run _inside_ the package, so `npm create typescript-oxc` still works
for consumers.

## License

MIT © Alex Spinu
