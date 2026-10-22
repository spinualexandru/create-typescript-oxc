# create-typescript-oxc

A minimal TypeScript starter built on the [oxc](https://oxc.rs) toolchain —
`oxlint`, `oxfmt` and [`tsrs`](https://github.com/oxc-project/tsrs) (the Rust port of
the TypeScript 7 compiler), pnpm, vitest, ESM only.

```sh
pnpm create typescript-oxc my-app
cd my-app
pnpm install
pnpm dev
```

`npm create typescript-oxc@latest my-app` and `yarn create typescript-oxc my-app`
work too. Omit the directory and you'll be prompted for one.

`tsrs` currently ships binaries for macOS (Apple silicon) and Linux (x64/arm64)
only. Windows support will follow once `tsrs` publishes a Windows build.

## Commands

```
pnpm dev          # node --watch src/index.ts
pnpm build        # tsrs -> dist/
pnpm start        # node dist/index.js
pnpm typecheck    # tsrs --noEmit
pnpm test         # vitest, including typechecking of tests
pnpm lint         # oxlint (type-aware)
pnpm lint:fix     # oxlint --fix
pnpm fmt          # oxfmt
pnpm fmt:check    # oxfmt --check
```

## License

MIT © Alex Spinu
