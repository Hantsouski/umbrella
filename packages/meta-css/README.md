<!-- This file is generated - DO NOT EDIT! -->
<!-- Please see: https://github.com/thi-ng/umbrella/blob/develop/CONTRIBUTING.md#changes-to-readme-files -->

# ![@thi.ng/meta-css](https://media.thi.ng/umbrella/banners-20230807/thing-meta-css.svg?36f6c755)

[![npm version](https://img.shields.io/npm/v/@thi.ng/meta-css.svg)](https://www.npmjs.com/package/@thi.ng/meta-css)
![npm downloads](https://img.shields.io/npm/dm/@thi.ng/meta-css.svg)
[![Mastodon Follow](https://img.shields.io/mastodon/follow/109331703950160316?domain=https%3A%2F%2Fmastodon.thi.ng&style=social)](https://mastodon.thi.ng/@toxi)

This project is part of the
[@thi.ng/umbrella](https://github.com/thi-ng/umbrella/) monorepo and anti-framework.

- [About](#about)
  - [Generate](#generate)
  - [Convert](#convert)
  - [Export](#export)
- [Framework generation rules](#framework-generation-rules)
- [Status](#status)
- [Related packages](#related-packages)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Usage examples](#usage-examples)
- [CLI](#cli)
  - [Basic usage example](#basic-usage-example)
  - [Generating framework code from bundled base definitions](#generating-framework-code-from-bundled-base-definitions)
  - [Generating CSS from `.meta` stylesheets](#generating-css-from-meta-stylesheets)
    - [*.meta stylesheets](#meta-stylesheets)
    - [Resulting CSS output](#resulting-css-output)
    - [index.html](#indexhtml)
- [Authors](#authors)
- [License](#license)

## About

Data-driven CSS component & framework codegen.

This package provides a CLI multi-tool to:

### Generate

The `generate` command is used to generate custom CSS frameworks from a number
of JSON rule specs. This process creates all desired, combinatorial versions of
various rules/declarations and exports them to another JSON file used as
intermediatary for the other commands provided by this toolchain. The
syntax/format of the generator rules is explained further on. These rules can be
split up into multiple files, can incude arbitrary media query criteria (all
later combinable), shared lookup tables for colors, margins, sizes, timings etc.

The package provides generator specs for a basic, configurable,
[tachyons.io](https://tachyons.io)-derived CSS framework in the
[/specs](https://github.com/thi-ng/umbrella/blob/develop/packages/meta-css/specs/)
directory. These specs are used for some example projects in this repo, but are
intended to be used as basic starting point for other custom frameworks.

```text
metacss generate --help

Usage: metacss generate [opts] input-dir

Flags:

-p, --pretty            Pretty print CSS
-v, --verbose           Display extra process information

Main:

-o STR, --out STR       Output file (or stdout)
--prec INT              Number of fractional digits (default: 3)
```

### Convert

The `convert` command is used to compile & bundle actual CSS from user-provided
MetaCSS stylesheets (`*.meta` files) and the JSON framework specs created by the
`generate` command. The meta-stylesheets support any CSS selectors, are nestable
and compose full CSS declarations from lists of the utility classes in the
generated framework. Each item (aka utility class name) can be prefixed with an
arbitrary number of media query IDs (also custom defined in the framework).
Selectors, declarations and media query criteria will be deduplicated and merged
from multiple input files.  The resulting CSS will only contain referenced rules
and can be generated in minified or pretty printed formats (it's also possible
to force include CSS classes which are otherwise unreferenced, using the
`--force` CLI arg). Additionally, multiple .meta files can be watched and will
be merged, existing CSS files can be included (prepended) in the bundled outout

```text
metacss convert --help

Usage: metacss convert [opts] input [...]

Flags:

--no-header             Don't emit generated header comment
-p, --pretty            Pretty print CSS
-v, --verbose           Display extra process information
-w, --watch             Watch input files for changes

Main:

--force STR[,..]        [multiple] CSS classes to force include (wildcards are
                        supported, @-prefix will read from file)
-I STR, --include STR   [multiple] Include CSS files (prepend)
-o STR, --out STR       Output file (or stdout)
-s STR, --specs STR     [required] Path to generated JSON defs
```

### Export

The `export` command is intended for those who're only interested in the CSS
framework generation aspect of this toolchain. This command merely takes an
existing generated framework JSON file and serializes it to a single CSS file,
e.g. to be then used with other CSS tooling (e.g. `postcss`). Users can choose
to generate variations of all defined utility classes for any of the defined
media query IDs. This will create suffixed versions of all classes (with their
appropriate media query wrappers) and cause a potentially massive output
(depending on the overall number/complexity of the generated classes).

As with the `convert` command, additional CSS files can be included (prepended)
in the output file.

```text
metacss export --help

Usage: metacss export [opts] input

Flags:

--no-header             Don't emit generated header comment
-p, --pretty            Pretty print CSS
-v, --verbose           Display extra process information

Main:

-I STR, --include STR   [multiple] Include CSS files (prepend)
-m STR, --media STR     Media query IDs (use 'ALL' for all)
-o STR, --out STR       Output file (or stdout)
```

Note: In all cases, final CSS generation itself is handled by
[thi.ng/hiccup-css](https://github.com/thi-ng/umbrella/blob/develop/packages/hiccup-css/)

**👷🏻 This is all WIP!** See example below for basic example usage...

## Framework generation rules

TODO — for now please see bundled example specs in
[/specs](https://github.com/thi-ng/umbrella/blob/develop/packages/meta-css/specs/)...

## Status

**ALPHA** - bleeding edge / work-in-progress

[Search or submit any issues for this package](https://github.com/thi-ng/umbrella/issues?q=%5Bmeta-css%5D+in%3Atitle)

## Related packages

- [@thi.ng/hiccup-css](https://github.com/thi-ng/umbrella/tree/develop/packages/hiccup-css) - CSS from nested JS data structures

## Installation

```bash
npx @thi.ng/meta-css --help
```

[Bun](https://bun.sh) is required instead of Node JS. The toolchain itself is
distributed as CLI bundle with **no runtime dependencies**. The following
dependencies are only shown for informational purposes and are (partially)
included in the bundle.

Package sizes (brotli'd, pre-treeshake): ESM: 11.25 KB

## Dependencies

- [@thi.ng/api](https://github.com/thi-ng/umbrella/tree/develop/packages/api)
- [@thi.ng/args](https://github.com/thi-ng/umbrella/tree/develop/packages/args)
- [@thi.ng/arrays](https://github.com/thi-ng/umbrella/tree/develop/packages/arrays)
- [@thi.ng/checks](https://github.com/thi-ng/umbrella/tree/develop/packages/checks)
- [@thi.ng/compose](https://github.com/thi-ng/umbrella/tree/develop/packages/compose)
- [@thi.ng/errors](https://github.com/thi-ng/umbrella/tree/develop/packages/errors)
- [@thi.ng/file-io](https://github.com/thi-ng/umbrella/tree/develop/packages/file-io)
- [@thi.ng/hiccup-css](https://github.com/thi-ng/umbrella/tree/develop/packages/hiccup-css)
- [@thi.ng/logger](https://github.com/thi-ng/umbrella/tree/develop/packages/logger)
- [@thi.ng/rstream](https://github.com/thi-ng/umbrella/tree/develop/packages/rstream)
- [@thi.ng/strings](https://github.com/thi-ng/umbrella/tree/develop/packages/strings)
- [@thi.ng/text-format](https://github.com/thi-ng/umbrella/tree/develop/packages/text-format)
- [@thi.ng/transducers](https://github.com/thi-ng/umbrella/tree/develop/packages/transducers)

## Usage examples

One project in this repo's
[/examples](https://github.com/thi-ng/umbrella/tree/develop/examples)
directory is using this package:

| Screenshot                                                                                                             | Description                           | Live demo                                             | Source                                                                             |
|:-----------------------------------------------------------------------------------------------------------------------|:--------------------------------------|:------------------------------------------------------|:-----------------------------------------------------------------------------------|
| <img src="https://raw.githubusercontent.com/thi-ng/umbrella/develop/assets/examples/meta-css-basics.png" width="240"/> | Basic thi.ng/meta-css usage & testbed | [Demo](https://demo.thi.ng/umbrella/meta-css-basics/) | [Source](https://github.com/thi-ng/umbrella/tree/develop/examples/meta-css-basics) |

## CLI

### Basic usage example

The `metacss` tool provides multiple commands. You can install & run it like so:

```text
npx @thi.ng/meta-css --help

 █ █   █           │
██ █               │
 █ █ █ █   █ █ █ █ │ @thi.ng/meta-css 0.0.1
 █ █ █ █ █ █ █ █ █ │ Data-driven CSS component & framework codegen
                 █ │
               █ █ │

Usage: metacss <cmd> [opts] input [...]
       metacss <cmd> --help

Available commands:

convert         : Transpile & bundle meta stylesheets to CSS
export          : Export entire generated framework as CSS
generate        : Generate framework rules from specs

Flags:

-v, --verbose           Display extra process information

Main:

-o STR, --out STR       Output file (or stdout)
```

### Generating framework code from bundled base definitions

To create our first framework, we first need to generate CSS utility classes
from given JSON generator specs. For simplicity the generated framework
definitions will be stored as JSON too and then used as lookup tables for actual
CSS translation in the next step.

```bash
# write generated CSS classes (in JSON)
metacss generate --out src/framework.json node_modules/@thi.ng/meta-css/specs
```

### Generating CSS from `.meta` stylesheets

#### *.meta stylesheets

The naming convention used by the [default framework
specs](https://github.com/thi-ng/umbrella/blob/develop/packages/meta-css/specs/)
is loosely based on [tachyons.io](https://tachyons.io), with the important
difference of media query handling. Using MetaCSS we don't have to pre-generate
mediaquery-specific versions, and any class ID/token can be prefixed with an
_arbitrary_ number of media query IDs (separated by `:`). These media queries
are defined as part of the framework JSON specs and when used as a prefix,
multiple query IDs can be combined freely. E.g. the token `dark:anim:bg-anim2`
will auto-create a merged CSS `@media`-query block for the query IDs `dark` and
`anim` and only emit the definition of `bg-anim2` for this combination (see
generated CSS further below).

readme.meta:

```text tangle:export/readme.meta

body { ma0 dark:bg-black dark:white bg-white black }

#app { ma3 }

.bt-group-v > a {
    db w100 l:w50 ph3 pv2 bwb1
    dark:bg-purple dark:white dark:b--black
    light:bg-light-blue light:black light:b--white
    {
        :hover { bg-gold black anim:bg-anim2 }
        :first-child { brt3 }
        :last-child { brb3 bwb0 }
    }
}
```

readme2.meta:

We will merge the definitions in this file with the ones from the file above
(i.e. adding & overriding some of the declarations, here: border radius):

```text tangle:export/readme2.meta
#app { pa2 }

.bt-group-v > a {
    {
        :first-child { brt4 }
        :last-child { brb4 }
    }
}
```

```bash
# if not out dir is specified writes result to stdout
# use previously generated specs for resolving all identifiers & media queries
metacss convert --pretty --specs src/framework.json readme.meta readme2.meta
```

#### Resulting CSS output

```css
/*! MetaCSS base v0.0.1 - generated by thi.ng/meta-css @ 2023-12-18T12:22:36.548Z */
body {
    margin: 0rem;
    background-color: #fff;
    color: #000;
}

#app {
    margin: 1rem;
    padding: .5rem;
}

.bt-group-v > a {
    display: block;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: .5rem;
    padding-bottom: .5rem;
    border-bottom-style: solid;
    border-bottom-width: .125rem;
}

.bt-group-v > a:hover {
    background-color: #ffb700;
    color: #000;
}

.bt-group-v > a:first-child {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
}

.bt-group-v > a:last-child {
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    border-bottom-style: solid;
    border-bottom-width: 0rem;
}

@media (prefers-color-scheme:dark) {

    body {
        background-color: #000;
        color: #fff;
    }

    .bt-group-v > a {
        background-color: #5e2ca5;
        color: #fff;
        border-color: #000;
    }

}

@media (min-width:60rem) {

    .bt-group-v > a {
        width: 50%;
    }

}

@media (prefers-color-scheme:light) {

    .bt-group-v > a {
        background-color: #96ccff;
        color: #000;
        border-color: #fff;
    }

}

@media not (prefers-reduced-motion) {

    .bt-group-v > a:hover {
        transition: 0.2s background-color ease-in-out;
    }

}
```

A simple HTML example using above MetaCSS styles:

#### index.html

```html tangle:export/index.html
<!doctype html>
<html>
    <head>
        <link rel="stylesheet" href="bundle.css"/>
    </head>
    <body>
        <div id="app" class="bt-group-v">
            <a href="#">One</a>
            <a href="#">Two</a>
            <a href="#">Three</a>
            <a href="#">Four</a>
        </div>
    </body>
</html>
```

## Authors

- [Karsten Schmidt](https://thi.ng)

If this project contributes to an academic publication, please cite it as:

```bibtex
@misc{thing-meta-css,
  title = "@thi.ng/meta-css",
  author = "Karsten Schmidt",
  note = "https://thi.ng/meta-css",
  year = 2023
}
```

## License

&copy; 2023 Karsten Schmidt // Apache License 2.0
