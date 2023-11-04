<!-- include ../../assets/tpl/header.md -->

<!-- toc -->

## About

{{pkg.description}}

[fxhash](https://fxhash.xyz) is a platform for publishing generative art
projects on the Tezos blockchain, where each individual project edition is
driven by an unique transaction hash, incl. the platform's provided PRNG which
is meant to be used by each project to ensure deterministic behavior and
reproducibility. The fxhash PRNG is an implementation of the [SFC32 (Simple Fast
Counter)
algorithm](https://github.com/thi-ng/umbrella/blob/develop/packages/random/src/sfc32.ts),
which is also provided by the
[@thi.ng/random](https://github.com/thi-ng/umbrella/tree/develop/packages/random)
parent package.

This support package provides a singleton implementation (`RND`) of that PRNG,
pre-seeded with the global `$fx.hash` (formerly `fxhash`) var injected by the
platform SDK. Of course pre-seeding with a transaction hash is only possible
when using this package in the browser and in conjunction with a [fxhash HTML
template](https://www.fxhash.xyz/doc/artist/guide-publish-generative-token#3-ways-to-start-a-project).
If the global `$fx.hash` or `fxhash` var is _not_ defined, the `RND` instance
will be seeded with a default seed (but can also be re-seeded later on). This
also allows this package to be used outside the browser env, where the fxhash
provided code snippet isn't available...

Additionally, the package also provides various wrappers for other commonly used
utilities from the @thi.ng/random package. These are wrapped in such a way that
they're using the `RND` singleton by default (but optionally accept any other
[`IRandom`](https://docs.thi.ng/umbrella/random/interfaces/IRandom.html)
implementation as additional arg). See examples below.

### Further functionality

**All** thi.ng/umbrella packages dealing with randomness in any shape or form
are supporting the above mentioned `IRandom` interface. That means the `RND`
instance can be passed to any of the functions/classes to provide more advanced
functionality, e.g.:

- [@thi.ng/arrays](https://github.com/thi-ng/umbrella/tree/develop/packages/arrays): Array shuffling
- [@thi.ng/color](https://github.com/thi-ng/umbrella/tree/develop/packages/color): Generate procedural/stochastic colors/themes/ranges, analog colors
- [@thi.ng/colored-noise](https://github.com/thi-ng/umbrella/tree/develop/packages/colored-noise): Various 1D noise generators
- [@thi.ng/gp](https://github.com/thi-ng/umbrella/tree/develop/packages/gp): Genetic programming toolkit
- [@thi.ng/k-means](https://github.com/thi-ng/umbrella/tree/develop/packages/k-means): nD k-Means clustering
- [@thi.ng/lowdisc](https://github.com/thi-ng/umbrella/tree/develop/packages/lowdisc): nD low-discrepancy sequence generators/iterators
- [@thi.ng/lsys](https://github.com/thi-ng/umbrella/tree/develop/packages/lsys): Highly customizable L-System interpreter
- [@thi.ng/poisson](https://github.com/thi-ng/umbrella/tree/develop/packages/poisson): nD poisson disc sampling
- [@thi.ng/vectors](https://github.com/thi-ng/umbrella/tree/develop/packages/vectors): 800+ vector functions, incl. random nD vector creation

{{meta.status}}

{{repo.supportPackages}}

{{repo.relatedPackages}}

{{meta.blogPosts}}

## Installation

{{pkg.install}}

{{pkg.size}}

**IMPORTANT**: When using this package (or any other packages from this
monorepo) for [fxhash](https://fxhash.xyz), you MUST use a bundler (e.g. Vite,
Parcel or Webpack), since the platform does not support ES module imports from
external sources/CDNs. A related boilerplate project template will be published
soon. Follow [@thing_umbrella](https://twitter.com/thing_umbrella) on Twitter
for updates...

## Dependencies

{{pkg.deps}}

{{repo.examples}}

## API

{{pkg.docs}}

TODO

```ts
import {
    RND,
    probability,
    pick, pickKey,
    weighted, weightedKey,
    seedFromHash,
} from "@thi.ng/random-fxhash";

const themes = {
    bw: ["#000", "#fff"],
    gray: ["#666", "#ccc"],
    red: ["#f00", "#000"],
    yellow: ["#ff0", "#00f"],
};

// (uniformly) pick a random value
const thickness = pick([0.5, 1, 2, 3]);

// (uniformly) pick random key from `themes`
const themeID = pickKey(themes);
// "gray"

// pick a key from given object of weights
// i.e. "bw" is 8x more likely to be picked than "yellow"
const themeID = weightedKey({ bw: 8, gray: 4, red: 2, yellow: 1 })
// "bw"

// same, but using individual arrays of choices/weights
const themeID = weighted(["bw", "gray", "red", "yellow"], [8, 4, 2, 1]);

// 20% chance for slow mode
const isSlow = probability(0.2);

// the IRandom interface also provides these methods:

// return a 32bit unsigned int
RND.int()

// return a float in [0..n) interval (default n = 1)
RND.float(n)

// return a float in [-n..n) interval (default n = 1)
RND.norm(n)

// return a float in [min..max) interval
RND.minmax(0.5, 1)

// return a int in [min..max) interval
RND.minmaxInt(0, 100)

// (re)seed from transaction hash
RND.seed(seedFromHash("ookorwLedQrCTPesBcUPrR2oRbPHgsAxe9xgCSNq4XAuZSaCvaB"));

// or reseed from uint's
RND.seed([1, 2, 3, 4]);

```

<!-- include ../../assets/tpl/footer.md -->
