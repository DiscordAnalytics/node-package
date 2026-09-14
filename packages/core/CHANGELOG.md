## @discordanalytics/core [2.10.1](https://github.com/DiscordAnalytics/node-package/compare/@discordanalytics/core@2.10.0...@discordanalytics/core@2.10.1) (2026-09-14)


### Bug Fixes

* **core:** dedupe concurrent CustomEvent fetches for the same key ([14af86d](https://github.com/DiscordAnalytics/node-package/commit/14af86d0232373576eb56c7c9df20b23437cbdb8))
* **core:** guard client_id use before init is called ([1d7bf72](https://github.com/DiscordAnalytics/node-package/commit/1d7bf7245b6e2bf7689848b6464f7db5b3e6786b))
* **core:** retry transient HTTP failures in api_call_with_retries ([0b82d05](https://github.com/DiscordAnalytics/node-package/commit/0b82d05042fc3cf74bc7ffccebe0c59d21d17684))
* **core:** sync package.json version with published 2.10.0 release ([bb5894c](https://github.com/DiscordAnalytics/node-package/commit/bb5894c5393460a601b50bb94208727df801e7b1))
* **core:** treat unset custom event as zero before decrementing ([b2cde8c](https://github.com/DiscordAnalytics/node-package/commit/b2cde8c15ed2ef1121aa3192d095c3fa81d2e0c1))
* **logging:** route init() bail-out messages through error() instead of console.log ([4736c71](https://github.com/DiscordAnalytics/node-package/commit/4736c71155384f92362866ae8f7df47896375087))
* reliability and data-integrity issues across core/discordjs/oceanic ([#390](https://github.com/DiscordAnalytics/node-package/issues/390)) ([1e25413](https://github.com/DiscordAnalytics/node-package/commit/1e2541304b0e0de3a1940f7b02984242ee67cb55))

# @discordanalytics/core [2.10.0](https://github.com/DiscordAnalytics/node-package/compare/@discordanalytics/core@2.9.1...@discordanalytics/core@2.10.0) (2026-07-09)


### Features

* add support for listing and creating custom events ([9b4363b](https://github.com/DiscordAnalytics/node-package/commit/9b4363b74a47c0840904c4b83f9cc4f65fcf4b58))

## @discordanalytics/core [2.9.1](https://github.com/DiscordAnalytics/node-package/compare/@discordanalytics/core@2.9.0...@discordanalytics/core@2.9.1) (2026-06-05)


### Bug Fixes

* **ci:** fixed CI ([ba2cd0d](https://github.com/DiscordAnalytics/node-package/commit/ba2cd0de1ea2c997e4fb27ebb1f94840dac805c9))
* **ci:** fixed CI ([#293](https://github.com/DiscordAnalytics/node-package/issues/293)) ([deda37b](https://github.com/DiscordAnalytics/node-package/commit/deda37bc0605a23774271424fca73d4b1ded0b81))

# @discordanalytics/core [2.9.0](https://github.com/DiscordAnalytics/node-package/compare/@discordanalytics/core@2.8.2...@discordanalytics/core@2.9.0) (2026-04-18)


### Bug Fixes

* can run without issues with tsx ([97f648a](https://github.com/DiscordAnalytics/node-package/commit/97f648a692f7ed2a18a31e94712a078dcca2e4d4))
* invalid field name ([a2f8ebb](https://github.com/DiscordAnalytics/node-package/commit/a2f8ebbcab596e3109b7c86c165d643d9d9b0b1a))
* invalid import ([11ce011](https://github.com/DiscordAnalytics/node-package/commit/11ce01137fa3f48a83224950aff7954df3622f02))
* invalid types and fields ([0000d9f](https://github.com/DiscordAnalytics/node-package/commit/0000d9f667a3d0592a81fe7a7aac042a0db6e5ce))
* remove dev api url ([4229638](https://github.com/DiscordAnalytics/node-package/commit/42296388d30f7f524f1d0416f4bcf9f95a57925d))


### Features

* add esm support ([52ae2a4](https://github.com/DiscordAnalytics/node-package/commit/52ae2a4b6ee616726a5d600e9913ea296e25115a))
* add linter and formatter ([8d815a6](https://github.com/DiscordAnalytics/node-package/commit/8d815a6ac7710599ff9bb4eecedab68f1a421637))

# @discordanalytics/core 1.0.0 (2026-04-18)


### Bug Fixes

* can run without issues with tsx ([97f648a](https://github.com/DiscordAnalytics/node-package/commit/97f648a692f7ed2a18a31e94712a078dcca2e4d4))
* Corrected string escaping in error messages and labels ([c8ac478](https://github.com/DiscordAnalytics/node-package/commit/c8ac4782fb9c9ec110fdd9e7f5b92cba72ef6e1f))
* custom events ([5ff785c](https://github.com/DiscordAnalytics/node-package/commit/5ff785c0a01def22fcd5797cba40a7d8acb9a36c))
* Fixed a problem in increment function ([c00f17a](https://github.com/DiscordAnalytics/node-package/commit/c00f17aaa72e11346f4d517948d542c249067cb5))
* fixed discordjs examples ([9f6ab9f](https://github.com/DiscordAnalytics/node-package/commit/9f6ab9f57bfc1dbed204a006af27d530870bfa1f))
* fixed missing types declarations in packages ([7719d2b](https://github.com/DiscordAnalytics/node-package/commit/7719d2ba4c6d7b3ef78bc7ddc0cd9dea323f7c92))
* Fixed some typos and bugs ([7eb6827](https://github.com/DiscordAnalytics/node-package/commit/7eb6827219e6cb623b6e52b1624f04fe5403b0b7))
* invalid field name ([a2f8ebb](https://github.com/DiscordAnalytics/node-package/commit/a2f8ebbcab596e3109b7c86c165d643d9d9b0b1a))
* invalid import ([11ce011](https://github.com/DiscordAnalytics/node-package/commit/11ce01137fa3f48a83224950aff7954df3622f02))
* invalid types and fields ([0000d9f](https://github.com/DiscordAnalytics/node-package/commit/0000d9f667a3d0592a81fe7a7aac042a0db6e5ce))
* remove dev api url ([4229638](https://github.com/DiscordAnalytics/node-package/commit/42296388d30f7f524f1d0416f4bcf9f95a57925d))
* Replace error throwing with console error logging for better error handling ([f9bdb57](https://github.com/DiscordAnalytics/node-package/commit/f9bdb579bce25ab826a74ccf7815f864ed57f6b7))
* rollback node-fetch to v2 ([a48888e](https://github.com/DiscordAnalytics/node-package/commit/a48888e163c557737af38f26c6aacd55f504c0da))
* **tests:** fixed test error on core package ([a636b53](https://github.com/DiscordAnalytics/node-package/commit/a636b5316dfb697d4af71c9cdbcb7a48c5fe3aa9))
* the package tries to fetch event data even if NODE_ENV is not production [#219](https://github.com/DiscordAnalytics/node-package/issues/219) ([468ecde](https://github.com/DiscordAnalytics/node-package/commit/468ecdea2d5036ccba15688d1db57579edc434c5))


### Features

* add Discord Analytics packages for various libraries (discord.js, discord.js-light, eris, oceanic) with tracking capabilities ([29a978a](https://github.com/DiscordAnalytics/node-package/commit/29a978aafc7f68a9f4c1224c801a5f5e452a65a5))
* add esm support ([52ae2a4](https://github.com/DiscordAnalytics/node-package/commit/52ae2a4b6ee616726a5d600e9913ea296e25115a))
* add linter and formatter ([8d815a6](https://github.com/DiscordAnalytics/node-package/commit/8d815a6ac7710599ff9bb4eecedab68f1a421637))
* Add tests for AnalyticsBase and example implementations for DiscordAnalytics (discordjs) ([6b3fac0](https://github.com/DiscordAnalytics/node-package/commit/6b3fac08b51b85984282b9d1f0ebaca0a42a35f0))
* Added README for every package ([9da565a](https://github.com/DiscordAnalytics/node-package/commit/9da565a9719416a35b9916e39081def3d715efd5))
* **deps:** removed node-fetch ([ef704c9](https://github.com/DiscordAnalytics/node-package/commit/ef704c9aa5d18c76e8ecfcc6d128c0b14bbfb512))
* **stats:** added user installs support ([3178b05](https://github.com/DiscordAnalytics/node-package/commit/3178b0540c08133ac6203740b0d00970e8f8ae83))
