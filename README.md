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
- Running `bazel aquery //pkgs/foo-app:typescript`, we can see that `bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/Foo.d.ts` and `bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/index.d.ts` are an input to the `TsValidateOptions` action, which feels like it might be unnecessary.
  ```
  action 'TsValidateOptions pkgs/foo-app/typescript_params.validation'
    Mnemonic: TsValidateOptions
    Target: //pkgs/foo-app:typescript
    Configuration: darwin_arm64-fastbuild
    Execution platform: @platforms//host:host
    ActionKey: ff8f2a8b55fa07f33b0839862de0c6e09aa8701f8aa9525c778cadb10defbd49
    Inputs: [bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@monorepo+foo-lib@0.0.0/node_modules/@monorepo/foo-lib, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@monorepo+tsconfig@0.0.0/node_modules/@monorepo/tsconfig, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+prop-types@15.7.13/node_modules/@types/prop-types, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react-dom@18.3.1/node_modules/@types/react, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react-dom@18.3.1/node_modules/@types/react-dom, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react@18.3.12/node_modules/@types/prop-types, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react@18.3.12/node_modules/@types/prop-types, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react@18.3.12/node_modules/@types/react, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react@18.3.12/node_modules/csstype, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/@types+react@18.3.12/node_modules/csstype, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/csstype@3.1.3/node_modules/csstype, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/js-tokens@4.0.0/node_modules/js-tokens, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/loose-envify@1.4.0/node_modules/js-tokens, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/loose-envify@1.4.0/node_modules/js-tokens, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/loose-envify@1.4.0/node_modules/loose-envify, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react-dom@18.3.1_react_18.3.1/node_modules/loose-envify, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react-dom@18.3.1_react_18.3.1/node_modules/react, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react-dom@18.3.1_react_18.3.1/node_modules/react-dom, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react-dom@18.3.1_react_18.3.1/node_modules/scheduler, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react@18.3.1/node_modules/loose-envify, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react@18.3.1/node_modules/loose-envify, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/react@18.3.1/node_modules/react, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/scheduler@0.23.2/node_modules/loose-envify, bazel-out/darwin_arm64-fastbuild/bin/node_modules/.aspect_rules_js/scheduler@0.23.2/node_modules/scheduler, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/@monorepo/foo-lib, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/@monorepo/tsconfig, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/@types/react, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/@types/react-dom, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/react, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/node_modules/react-dom, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/tsconfig.json, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/Foo.d.ts, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/Foo.js, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/index.d.ts, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/dist/index.js, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/node_modules/@monorepo/tsconfig, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/node_modules/@types/react, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/node_modules/react, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/package.json, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/tsconfig.json, bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-lib/tsconfig.json, bazel-out/darwin_arm64-fastbuild/bin/pkgs/tsconfig/package.json, bazel-out/darwin_arm64-fastbuild/bin/pkgs/tsconfig/web.json, bazel-out/darwin_arm64-opt-exec-ST-d57f47055a04/bin/external/aspect_rules_ts~~ext~npm_typescript/validator_/validator, bazel-out/darwin_arm64-opt-exec-ST-d57f47055a04/internal/_middlemen/external_Saspect_Urules_Uts~~ext~npm_Utypescript_Svalidator_U_Svalidator-runfiles]
    Outputs: [bazel-out/darwin_arm64-fastbuild/bin/pkgs/foo-app/typescript_params.validation]
    Environment: [BAZEL_BINDIR=bazel-out/darwin_arm64-fastbuild/bin]
    Command Line: (exec bazel-out/darwin_arm64-opt-exec-ST-d57f47055a04/bin/external/aspect_rules_ts~~ext~npm_typescript/validator_/validator \
      pkgs/foo-app/tsconfig.json \
      pkgs/foo-app/typescript_params.validation \
      @@//pkgs/foo-app:typescript \
      pkgs/foo-app \
      '{"allow_js":false,"composite":true,"declaration":false,"declaration_map":false,"emit_declaration_only":false,"incremental":true,"isolated_typecheck":false,"no_emit":false,"preserve_jsx":false,"resolve_json_module":false,"source_map":false,"ts_build_info_file":""}')
  # Configuration: 560cbbc30eb8532f76c2740b5e1e65ab79ce3620f5d0426a2d01f2b35fdfd776
  # Execution platform: @@platforms//host:host
  ```