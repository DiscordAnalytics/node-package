## [2.8.1](https://github.com/DiscordAnalytics/node-package/compare/v2.8.0...v2.8.1) (2026-01-27)


### Bug Fixes

* fixed missing types declarations in packages ([7719d2b](https://github.com/DiscordAnalytics/node-package/commit/7719d2ba4c6d7b3ef78bc7ddc0cd9dea323f7c92))

# [2.8.0](https://github.com/DiscordAnalytics/node-package/compare/v2.7.0...v2.8.0) (2026-01-23)


### Bug Fixes

* **ci:** added pnpm to release workflow ([cfacc8d](https://github.com/DiscordAnalytics/node-package/commit/cfacc8d3001fe9ee54a7444444597150ecd81d66))
* **ci:** fix semantic release config file ([8668303](https://github.com/DiscordAnalytics/node-package/commit/866830380275579a88e977c0569d39b99d770b02))
* **ci:** fixed release workflow permission errors ([7c81a10](https://github.com/DiscordAnalytics/node-package/commit/7c81a10ff41831b5ccd45bffde3cb8921969963e))
* **ci:** fixed release workflow permission errors ([3fbfe5d](https://github.com/DiscordAnalytics/node-package/commit/3fbfe5d7f372fde0cd46e1aeb9f3302aa1bd5bfd))
* **ci:** fixed release workflow permission errors ([f2ab188](https://github.com/DiscordAnalytics/node-package/commit/f2ab1889179c70e641655820b805869b043b87b3))
* **ci:** fixed release workflow permission errors ([51363ec](https://github.com/DiscordAnalytics/node-package/commit/51363ec930e02236b95a3b4a220128aede3385c0))
* **ci:** removed pnpm publish ([c3752b2](https://github.com/DiscordAnalytics/node-package/commit/c3752b2949afb5f1b4f543b3eb08f610964c5d26))
* **examples:** fixed type error in oceanic example ([1a83be5](https://github.com/DiscordAnalytics/node-package/commit/1a83be53977e355ee1da6e857e4c2d9c0028e56f))
* fixed guild locales ([#228](https://github.com/DiscordAnalytics/node-package/issues/228)) ([3bcdf98](https://github.com/DiscordAnalytics/node-package/commit/3bcdf9893f497cf05a703e42091cc12d6e072c81))
* fixed guild locales [#227](https://github.com/DiscordAnalytics/node-package/issues/227) ([f31e9f0](https://github.com/DiscordAnalytics/node-package/commit/f31e9f00cff55c8c152183a38b0684ba764fb36a))


### Features

* **ci:** added pnpm support to semantic release ([9b89f55](https://github.com/DiscordAnalytics/node-package/commit/9b89f55017cb328e3e769dfe955e1f92687afc27))
* **stats:** added user installs support ([3178b05](https://github.com/DiscordAnalytics/node-package/commit/3178b0540c08133ac6203740b0d00970e8f8ae83))

# [2.7.0](https://github.com/DiscordAnalytics/node-package/compare/v2.6.2...v2.7.0) (2026-01-11)


### Features

* **deps:** removed node-fetch ([ef704c9](https://github.com/DiscordAnalytics/node-package/commit/ef704c9aa5d18c76e8ecfcc6d128c0b14bbfb512))

## [2.6.2](https://github.com/DiscordAnalytics/node-package/compare/v2.6.1...v2.6.2) (2026-01-03)


### Bug Fixes

* rollback node-fetch to v2 ([a48888e](https://github.com/DiscordAnalytics/node-package/commit/a48888e163c557737af38f26c6aacd55f504c0da))

## [2.6.1](https://github.com/DiscordAnalytics/node-package/compare/v2.6.0...v2.6.1) (2026-01-01)


### Bug Fixes

* the package tries to fetch event data even if NODE_ENV is not production [#219](https://github.com/DiscordAnalytics/node-package/issues/219) ([468ecde](https://github.com/DiscordAnalytics/node-package/commit/468ecdea2d5036ccba15688d1db57579edc434c5))

# [2.6.0](https://github.com/DiscordAnalytics/node-package/compare/v2.5.0...v2.6.0) (2025-12-19)


### Bug Fixes

* console.error() when the App and/or token isn't coordinate ([441a75d](https://github.com/DiscordAnalytics/node-package/commit/441a75dc6ff2c3ec8a68f39f9aeec76560e2a48b))
* Correct locale type handling in calculateGuildMembersRepartition method of DiscordAnalytics class ([05da160](https://github.com/DiscordAnalytics/node-package/commit/05da16095ae94933c1ece16180fc3114c221495d))
* Corrected string escaping in error messages and labels ([c8ac478](https://github.com/DiscordAnalytics/node-package/commit/c8ac4782fb9c9ec110fdd9e7f5b92cba72ef6e1f))
* custom events ([5ff785c](https://github.com/DiscordAnalytics/node-package/commit/5ff785c0a01def22fcd5797cba40a7d8acb9a36c))
* Fixed a problem in increment function ([c00f17a](https://github.com/DiscordAnalytics/node-package/commit/c00f17aaa72e11346f4d517948d542c249067cb5))
* fixed discordjs examples ([9f6ab9f](https://github.com/DiscordAnalytics/node-package/commit/9f6ab9f57bfc1dbed204a006af27d530870bfa1f))
* Fixed some typos and bugs ([7eb6827](https://github.com/DiscordAnalytics/node-package/commit/7eb6827219e6cb623b6e52b1624f04fe5403b0b7))
* made repository private ([e8de4e0](https://github.com/DiscordAnalytics/node-package/commit/e8de4e0cd256e74afb1054abb1c4ce9f85d5f01f))
* made repository private ([d8247d0](https://github.com/DiscordAnalytics/node-package/commit/d8247d027ee552ec47e932343f4ce7390292c011))
* Replace error throwing with console error logging for better error handling ([f9bdb57](https://github.com/DiscordAnalytics/node-package/commit/f9bdb579bce25ab826a74ccf7815f864ed57f6b7))
* **tests:** fixed test error on core package ([a636b53](https://github.com/DiscordAnalytics/node-package/commit/a636b5316dfb697d4af71c9cdbcb7a48c5fe3aa9))
* Update documentation links in README for consistency ([2708d5c](https://github.com/DiscordAnalytics/node-package/commit/2708d5cc1c1128abb698c143244dfed0378f3ed0))
* Update package installation and import paths for DiscordAnalytics in README ([4d38ded](https://github.com/DiscordAnalytics/node-package/commit/4d38ded5c9dce4c981acc02392dc5e987ebffdc5))


### Features

* Add calculateGuildMembers method and refactor guild members handling in DiscordAnalytics class ([b434099](https://github.com/DiscordAnalytics/node-package/commit/b434099f43c3731f413d9f2f4822211016fd11b4))
* Add client_id property and improve error handling in AnalyticsBase and DiscordAnalytics classes ([34022c8](https://github.com/DiscordAnalytics/node-package/commit/34022c84b795ed9463463a6ecf5379ef8208f83b))
* Add coverage configuration to Vitest for package source files ([d079fa4](https://github.com/DiscordAnalytics/node-package/commit/d079fa4ff86139e75f923ce2e8d645ce561e7444))
* add Discord Analytics packages for various libraries (discord.js, discord.js-light, eris, oceanic) with tracking capabilities ([29a978a](https://github.com/DiscordAnalytics/node-package/commit/29a978aafc7f68a9f4c1224c801a5f5e452a65a5))
* Add documentation for trackInteractions method in DiscordAnalytics class ([b578178](https://github.com/DiscordAnalytics/node-package/commit/b57817850eec66126fab8995786e0f3d79cd72ef))
* Add ensure method call in CustomEvent constructor for validation ([84366d5](https://github.com/DiscordAnalytics/node-package/commit/84366d5e779a33a3012851f7e4129633cbd4afe5))
* Add example for DiscordAnalytics (discordjs-light) with interaction handling and sharding support ([f54fe30](https://github.com/DiscordAnalytics/node-package/commit/f54fe309bf56fa374b2763ec0afcab9a93ec3575))
* Add new error codes and implement AnalyticsBase class for tracking and sending stats ([f9c5d54](https://github.com/DiscordAnalytics/node-package/commit/f9c5d546ccf0ecf5685ca9f7e07603b0fe4a65b4))
* Add sharding example using ShardingManager ([1cd73db](https://github.com/DiscordAnalytics/node-package/commit/1cd73db5f663362a68ddfc6903a514c96cb2afa2))
* Add tests for AnalyticsBase and example implementations for DiscordAnalytics (discordjs) ([6b3fac0](https://github.com/DiscordAnalytics/node-package/commit/6b3fac08b51b85984282b9d1f0ebaca0a42a35f0))
* Add updateOrInsert method and refactor interaction tracking in DiscordAnalytics class ([9a294fe](https://github.com/DiscordAnalytics/node-package/commit/9a294fe45698435790ac2853eb4bdddac7f4352f))
* Added README for every package ([9da565a](https://github.com/DiscordAnalytics/node-package/commit/9da565a9719416a35b9916e39081def3d715efd5))
* Enhance documentation for events and trackGuilds methods in AnalyticsBase class ([e5b3cd2](https://github.com/DiscordAnalytics/node-package/commit/e5b3cd24b7d58082ffea45286f11476729d0f260))
* Enhance user type tracking in trackInteractions method (eris) ([1a8b1e8](https://github.com/DiscordAnalytics/node-package/commit/1a8b1e809c452600137dff7cf5a3bdbf9a829b75))
* **eris:** Add example implementation for DiscordAnalytics with interaction handling and command responses ([32ec1a9](https://github.com/DiscordAnalytics/node-package/commit/32ec1a9d61a7719fa5551a1c67f6f2302eab2149))
* Initialize analytics before tracking events in usage examples ([0eb6793](https://github.com/DiscordAnalytics/node-package/commit/0eb6793d20075c4dbcd3b6e97b446774610862e6))
* **oceanic:** Implement DiscordAnalytics example with interaction handling and command responses ([6d0f58d](https://github.com/DiscordAnalytics/node-package/commit/6d0f58db5f9129c72d9d142c13130a7d52ef7326))
* Refactor AnalyticsBase and DiscordAnalytics classes for improved functionality and code clarity ([e26a091](https://github.com/DiscordAnalytics/node-package/commit/e26a091e8275de8b565063963bee919550168818))
