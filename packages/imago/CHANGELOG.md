# Change Log

- **Last updated**: 2024-02-27T20:35:06Z
- **Generator**: [thi.ng/monopub](https://thi.ng/monopub)

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org/) for commit guidelines.

**Note:** Unlisted _patch_ versions only involve non-code or otherwise excluded changes
and/or version bumps of transitive dependencies.

## [0.4.0](https://github.com/thi-ng/umbrella/tree/@thi.ng/imago@0.4.0) (2024-02-27)

#### 🚀 Features

- add blurhash output option, update deps ([b7ffedd](https://github.com/thi-ng/umbrella/commit/b7ffedd))

## [0.3.0](https://github.com/thi-ng/umbrella/tree/@thi.ng/imago@0.3.0) (2024-02-23)

#### 🚀 Features

- major update ([f938d60](https://github.com/thi-ng/umbrella/commit/f938d60))
  - restructure package, split out all ops into separate files
  - update `ProcSpec`, rename `type` => `op`
  - add text layer support (via SVG)
  - add/update EXIF handling & opts
  - add ICC profile handling & opts
  - update output path collection to use object
    - update `OutputSpec` to require output `id`
  - update `NestSpec` to support multiple child pipelines
    - spawn children via Promise.all()
  - add/update docstrings
  - update deps & pkg exports

## [0.2.0](https://github.com/thi-ng/umbrella/tree/@thi.ng/imago@0.2.0) (2024-02-22)

#### 🚀 Features

- add support for custom path part replacements ([b0419e1](https://github.com/thi-ng/umbrella/commit/b0419e1))
- add more path part replacements ([9f84a8a](https://github.com/thi-ng/umbrella/commit/9f84a8a))
- collect all output paths, update processImage() result ([a3ca52f](https://github.com/thi-ng/umbrella/commit/a3ca52f))

## [0.1.0](https://github.com/thi-ng/umbrella/tree/@thi.ng/imago@0.1.0) (2024-02-22)

#### 🚀 Features

- import as new pkg ([66b62ff](https://github.com/thi-ng/umbrella/commit/66b62ff))
- add output path formatters, restructure pkg ([0b06527](https://github.com/thi-ng/umbrella/commit/0b06527))

#### ♻️ Refactoring

- update all `node:*` imports ([c71a526](https://github.com/thi-ng/umbrella/commit/c71a526))
