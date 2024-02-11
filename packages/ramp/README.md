<!-- This file is generated - DO NOT EDIT! -->
<!-- Please see: https://github.com/thi-ng/umbrella/blob/develop/CONTRIBUTING.md#changes-to-readme-files -->
> [!IMPORTANT]
> ‼️ Announcing the thi.ng user survey 2024 📋
>
> [Please participate in the survey here!](https://forms.gle/XacbSDEmQMPZg8197)\
> (open until end of February)
>
> **To achieve a better sample size, I'd highly appreciate if you could
> circulate the link to this survey in your own networks.**
>
> [Discussion](https://github.com/thi-ng/umbrella/discussions/447)

# ![@thi.ng/ramp](https://media.thi.ng/umbrella/banners-20230807/thing-ramp.svg?4bf9a6f2)

[![npm version](https://img.shields.io/npm/v/@thi.ng/ramp.svg)](https://www.npmjs.com/package/@thi.ng/ramp)
![npm downloads](https://img.shields.io/npm/dm/@thi.ng/ramp.svg)
[![Mastodon Follow](https://img.shields.io/mastodon/follow/109331703950160316?domain=https%3A%2F%2Fmastodon.thi.ng&style=social)](https://mastodon.thi.ng/@toxi)

> [!NOTE]
> This is one of 190 standalone projects, maintained as part
> of the [@thi.ng/umbrella](https://github.com/thi-ng/umbrella/) monorepo
> and anti-framework.
>
> 🚀 Help me to work full-time on these projects by [sponsoring me on
> GitHub](https://github.com/sponsors/postspectacular). Thank you! ❤️

- [About](#about)
- [Status](#status)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Usage examples](#usage-examples)
- [API](#api)
  - [Numeric ramps](#numeric-ramps)
  - [nD Vector ramps](#nd-vector-ramps)
- [Authors](#authors)
- [License](#license)

## About

Extensible, interpolated nD lookup tables for parameter tweening.

![screenshot](https://raw.githubusercontent.com/thi-ng/umbrella/develop/assets/ramp/readme.png)

## Status

**STABLE** - used in production

[Search or submit any issues for this package](https://github.com/thi-ng/umbrella/issues?q=%5Bramp%5D+in%3Atitle)

## Installation

```bash
yarn add @thi.ng/ramp
```

ES module import:

```html
<script type="module" src="https://cdn.skypack.dev/@thi.ng/ramp"></script>
```

[Skypack documentation](https://docs.skypack.dev/)

For Node.js REPL:

```js
const ramp = await import("@thi.ng/ramp");
```

Package sizes (brotli'd, pre-treeshake): ESM: 1.57 KB

## Dependencies

- [@thi.ng/arrays](https://github.com/thi-ng/umbrella/tree/develop/packages/arrays)
- [@thi.ng/compare](https://github.com/thi-ng/umbrella/tree/develop/packages/compare)
- [@thi.ng/math](https://github.com/thi-ng/umbrella/tree/develop/packages/math)
- [@thi.ng/transducers](https://github.com/thi-ng/umbrella/tree/develop/packages/transducers)
- [@thi.ng/vectors](https://github.com/thi-ng/umbrella/tree/develop/packages/vectors)

## Usage examples

One project in this repo's
[/examples](https://github.com/thi-ng/umbrella/tree/develop/examples)
directory is using this package:

| Screenshot                                                                                                        | Description                                 | Live demo                                        | Source                                                                        |
|:------------------------------------------------------------------------------------------------------------------|:--------------------------------------------|:-------------------------------------------------|:------------------------------------------------------------------------------|
| <img src="https://raw.githubusercontent.com/thi-ng/umbrella/develop/assets/examples/ramp-synth.png" width="240"/> | Unison wavetable synth with waveform editor | [Demo](https://demo.thi.ng/umbrella/ramp-synth/) | [Source](https://github.com/thi-ng/umbrella/tree/develop/examples/ramp-synth) |

## API

[Generated API docs](https://docs.thi.ng/umbrella/ramp/)

### Numeric ramps

```ts tangle:export/readme.ts
import { linear, hermite } from "@thi.ng/ramp";

const rampL = linear([[0.1, 0], [0.5, 1], [0.9, 0]]);
const rampH = hermite([[0.1, 0], [0.5, 1], [0.9, 0]]);

for(let i = 0; i <= 10; i++) {
    const t = i / 10;
    console.log(t, rampL.at(t).toFixed(2), rampH.at(t).toFixed(2));
}

// 0   0.00 0.00
// 0.1 0.00 0.00
// 0.2 0.25 0.16
// 0.3 0.50 0.50
// 0.4 0.75 0.84
// 0.5 1.00 1.00
// 0.6 0.75 0.84
// 0.7 0.50 0.50
// 0.8 0.25 0.16
// 0.9 0.00 0.00
// 1   0.00 0.00
```

### nD Vector ramps

```ts tangle:export/readme-vector.ts
import { HERMITE_V, ramp } from "@thi.ng/ramp";
import { FORMATTER, VEC3 } from "@thi.ng/vectors";

// use the generic `ramp()` factory function with a custom implementation
// see: https://docs.thi.ng/umbrella/ramp/interfaces/RampImpl.html
const rgb = ramp(
    // use linear vector interpolation with Vec3 API
    HERMITE_V(VEC3),
    // keyframes
    [
        [0.1, [1, 0, 0]], // red
        [0.5, [0, 1, 0]], // green
        [0.9, [0, 0, 1]], // blue
    ]
);

for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    console.log(t, FORMATTER(rgb.at(t)));
}

// 0   [1.000, 0.000, 0.000]
// 0.1 [1.000, 0.000, 0.000]
// 0.2 [0.750, 0.250, 0.000]
// 0.3 [0.500, 0.500, 0.000]
// 0.4 [0.250, 0.750, 0.000]
// 0.5 [0.000, 1.000, 0.000]
// 0.6 [0.000, 0.750, 0.250]
// 0.7 [0.000, 0.500, 0.500]
// 0.8 [0.000, 0.250, 0.750]
// 0.9 [0.000, 0.000, 1.000]
// 1   [0.000, 0.000, 1.000]
```

## Authors

- [Karsten Schmidt](https://thi.ng)

If this project contributes to an academic publication, please cite it as:

```bibtex
@misc{thing-ramp,
  title = "@thi.ng/ramp",
  author = "Karsten Schmidt",
  note = "https://thi.ng/ramp",
  year = 2019
}
```

## License

&copy; 2019 - 2024 Karsten Schmidt // Apache License 2.0
