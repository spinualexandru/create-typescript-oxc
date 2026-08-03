# create-typescript-oxc

A minimal TypeScript starter built on the [oxc](https://oxc.rs) toolchain —
`oxlint` and `oxfmt`, TypeScript 7, pnpm, vitest, ESM only.

```sh
pnpm create typescript-oxc my-app
cd my-app
pnpm install
pnpm dev
```

`npm create typescript-oxc@latest my-app` and `yarn create typescript-oxc my-app`
work too. Omit the directory and you'll be prompted for one.

## Commands

```
pnpm dev          # tsx watch src/index.ts
pnpm build        # tsc -> dist/
pnpm start        # node dist/index.js
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest, including typechecking of tests
pnpm lint         # oxlint (type-aware)
pnpm lint:fix     # oxlint --fix
pnpm fmt          # oxfmt
pnpm fmt:check    # oxfmt --check
```

## License

MIT © Alex Spinu
