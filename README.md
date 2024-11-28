# `tsconfig-package`

Illustrate an issue with [`rules_ts`](https://github.com/aspect-build/rules_ts) and `ts_config()`.

## Repro
- Run `bazel clean`
- Run `bazel build //pkgs/foo-app:typescript`
- Run `tree bazel-bin/pkgs -I node_modules` and observe that `.d.ts` files have been produced in `bazel-bin/pkgs/foo-lib/dist`. This is unfortunate! These shouldn't be produced until you run `//pkgs/foo-app:typescript_typecheck`. Running `bazel build //pkgs/foo-app:typescript` should only run transpilation.
  ```
  bazel-bin/pkgs
  ├── foo-app
  │   ├── dist
  │   │   ├── App.js
  │   │   └── main.js
  │   ├── tsconfig.json
  │   └── typescript_params.validation
  ├── foo-lib
  │   ├── dist
  │   │   ├── Foo.d.ts
  │   │   ├── Foo.js
  │   │   ├── index.d.ts
  │   │   └── index.js
  │   ├── package.json
  │   ├── src
  │   │   ├── Foo.tsx
  │   │   └── index.ts
  │   ├── tsconfig.json
  │   ├── typescript.tsbuildinfo
  │   └── typescript_params.validation
  └── tsconfig
      ├── package.json
      └── web.json
  ```
- Setting `validate = False` in `//pkgs/foo-app:typescript` prevents this:
  ```
  bazel-bin/pkgs
  ├── foo-app
  │   └── dist
  │       ├── App.js
  │       └── main.js
  ├── foo-lib
  │   ├── dist
  │   │   ├── Foo.js
  │   │   └── index.js
  │   ├── package.json
  │   ├── tsconfig.json
  │   └── typescript_params.validation
  └── tsconfig
      ├── package.json
      └── web.json
  ```
- Narrowing `deps` in `//pkgs/foo-app:tsconfig` works as well:
  ```diff
  --- a/pkgs/foo-app/BUILD.bazel
  +++ b/pkgs/foo-app/BUILD.bazel
  @@ -9,7 +9,7 @@ npm_link_all_packages(name = "node_modules")
   ts_config(
       name = "tsconfig",
       src = "tsconfig.json",
  -    deps = [":node_modules"]
  +    deps = [":node_modules/@monorepo/tsconfig"]
   )
  ```