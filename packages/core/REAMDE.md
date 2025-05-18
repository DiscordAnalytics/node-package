# Discord Analytics

## Overview
This package is a wrapper for the Discord Analytics API. It allows you to track events and send them to the Discord Analytics API.

## Installation
You can install the package using npm:

```bash
npm install @discordanalytics/core
# or
yarn add @discordanalytics/core
# or
pnpm add @discordanalytics/core
```

### Usage
Discord Analytics core package is used by other packages like `@discordanalytics/discordjs`, `@discordanalytics/discordjs-light`, `@discordanalytics/eris`, and `@discordanalytics/oceanic`. You don't need to use this package directly unless you want to use the core features without any wrapper.

## API
### `AnalyticsBase`
The main class of the package. It is used to track events and send them to the Discord Analytics API.
### `CustomEvent`
A class that represents a custom event. It is used to track custom events and send them to the Discord Analytics API.
