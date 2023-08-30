## 📒 Changelog

### of [@igor.dvlpr/aria](https://github.com/igorskyflyer/npm-adblock-aria-compiler/)

<br>

## v2.0.0

<p align="right"><em>28-Aug-2023</em></p>

- **🪅 feat** **\[BREAKING]**: enforce order of statements ([#60](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/60))

> 💡 Keeps track of order of statements (nodes) in the input template and enforces rules, thus keeping the integrity and validity of the exported Adblock filter file.

The following rules are enforced:

- a [`header`](https://github.com/igorskyflyer/file-format-adbt#header) statement cannot appear after a [`meta`](https://github.com/metaigorskyflyer/file-format-adbt#meta) statement
- a [`header`](https://github.com/igorskyflyer/file-format-adbt#header) statement cannot appear after an [`include`](https://github.com/igorskyflyer/file-format-adbt#include)/[`import`](https://github.com/igorskyflyer/file-format-adbt#import), statement
- a [`meta`](https://github.com/igorskyflyer/file-format-adbt#meta) statement cannot appear after an [`include`](https://github.com/igorskyflyer/file-format-adbt#include)/[`import`](https://github.com/igorskyflyer/file-format-adbt#import), statement
- **`no statements`** can appear after an [`export`](https://github.com/igorskyflyer/file-format-adbt#export) statement.

Will `throw` when order is not correct.

- **🪅 feat**: evaluate statements eagerly ([#74](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/74))
- **🪅 feat**: reorganise order of nodes detection by usage/order of statements ([#72](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/72))
- **🪅 feat**: add support for inline meta, has highest priority when setting metadata ([#68](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/68))
- **🪅 feat**: always amend the `Expires` field to the metadata of the compiled filter file, add _"(update frequency)"_ if not present ([#66](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/66))
- **🪅 feat**: always add `Entries` field to the metadata of the compiled filter file ([#64](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/64))
- **🪅 feat**: make all user input paths universal, i.e. allow all OS' to use a forward slash (_"`/`"_) as the path separator ([#62](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/62))

  > _🌟 Via [uPath](https://www.npmjs.com/package/@igor.dvlpr/upath)_

- **🪅 feat**: detect unsupported identifiers/code ([#58](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/58))
- **✅ fix**: log unsupported identifiers ([#76](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/76))
- **✅ fix**: refactor nodes logging ([#70](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/70))
- **✅ fix**: import paths not being tracked ([#56](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/56))
- **✅ fix**: actions remove final newline ([#54](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/54))
- **✅ fix**: filter path not available in logs ([#52](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/52))
- **✅ fix**: various fixes to strings used in logging
- **💻 dev**: invert node orders([#78](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/78))
- **💻 dev**: add tests and coverage

<br>

## v1.6.1

<p align="right"><em>22-Aug-2023</em></p>

- **✅ fix**: fix an error when no action is provided, ([#50](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/50))
- **✅ fix**: fix an error when passing multiple values for error logging, ([#51](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/51))

<br>

## v1.6.0

<p align="right"><em>22-Aug-2023</em></p>

### [ADBT v1.3.0](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.3.0)

- **🪅 feat**: add support for statement actions ([#48](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/48)), currently available for:
  - [**`include`**](https://github.com/igorskyflyer/file-format-adbt#include),
  - [**`import`**](https://github.com/igorskyflyer/file-format-adbt#import)

<br>

> 💡Actions allow you to invoke a certain function when including/importing filter list files.
>
> Supported actions:
>
> - trim (trims whitespace for each line from the included filter list file)
> - dedupe (removes duplicates from the included filter list file)
> - sort (sorts lines from the included filter list file)
> - append (appends an arbitrary string to each line from the included filter list file)
> - strip (strips a certain element of each line from the included filter list file)

<br>

> You can read more about [Actions](https://github.com/igorskyflyer/file-format-adbt#-actions) in the official ADBT documentation.

<br>

## v1.5.0

<p align="right"><em>20-Aug-2023</em></p>

### [ADBT v1.2.0](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.2.0)

- **🪅 feat**: implement the **`import`** statement ([#45](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/45))
  > **`import`** statements behave exactly the same as **`include`** but prepend the file path of the included filter (as a comment)
- **🪅 feat**: implement the **`tag`** statement ([#40](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/40))
  > Introduce a tagging system; special comments that get inserted in the resulting filter file, for easier navigation, search, etc.
  >
  > _🌟 Inspired by [AdVoid](https://github.com/igorskyflyer/ad-void)'s way of navigation._

### CLI

- **✅ fix**: when passing the **`-t`** flag, the input template wasn't being compiled

<br>

## v1.4.0

<p align="right"><em>19-Aug-2023</em></p>

### [ADBT v1.1.0](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.1.0)

- **🪅 feat**: support for Expires meta variable ([#38](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/38))

### CLI

- **🪅 feat**: log changes of the export file ([#36](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/36))
- **💻 dev**: remove **`value`** property for placeholders

<br>

## v1.3.0

<p align="right"><em>14-Aug-2023</em></p>

- **🪅 feat**: add support for absolute paths for header, include and export ([#30](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/30))
- **✅ fix**: literal versioning type leak into the exported file ([#32](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/32))
- **✅ fix**: don't trigger unreachable code warning for whitespace at the end of file ([#34](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/34))
- **💻 dev**: upgrade [@igor.dvlpr/zing](https://www.npmjs.com/package/@igor.dvlpr/zing)

<br>

## v1.2.5

<p align="right"><em>02-Aug-2023</em></p>

- **🪅 feat**: log execution time ([#28](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/28))
- **🪅 feat**: use [ADBT v1.0.1](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.0.1)
- **✅ fix**: always output absolute export path
  - **🪅 feat**: unreachable code detection
- **📜 docs**: update ADBT API link

<br>

## v1.2.4

<p align="right"><em>02-Aug-2023</em></p>

- **💻 dev**: use automated version tagging

<br>

## v1.2.3

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: incorrect CLI version

<br>

## v1.2.2

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: enable passing of relative template paths while using a `root` absolute path ([#24](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/24))

<br>

## v1.2.1

<p align="right"><em>02-Aug-2023</em></p>

- **📜 docs**: update API

<br>

## v1.2.0

<p align="right"><em>02-Aug-2023</em></p>

- **🪅 feat**: root directory option
- **✅ fix**: cwd path ([#23](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/23))

<br>

## v1.1.2

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: sourceline wrong numbering ([#18](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/18))
- **✅ fix**: String escaping ([#17](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/17))

## v1.1.1

<p align="right"><em>01-Aug-2023</em></p>

- **✅ fix**: version placeholder was injected even when a version is defined ([#14](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/14))
- **✅ fix**: don't prepend whitespace when injecting headers ([#12](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/12))

<br>

## v1.1.0

<p align="right"><em>31-Jul-2023</em></p>

- **🪅 feat**: don't include already included filter lists ([#10](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/10))

<br>

## v1.0.3

<p align="right"><em>29-Jul-2023</em></p>

- **✅ fix**: handle single quotes `'` in file paths ([#8](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/8))

<br>

## v1.0.2

<p align="right"><em>29-Jul-2023</em></p>

- **🪅 feat**: add performance information to CLI output

<br>

## v1.0.1

<p align="right"><em>28-Jul-2023</em></p>

- **✅ fix**: encode all files as UTF-8 ([#4](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/4))
- **✅ fix**: meta and compile variables mixup ([#6](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/6))
- **💻 dev**: upgrade TypeScript

<br>

## v1.0.0

<p align="right"><em>27-Jul-2023</em></p>

- **🚀 launch**: initial release 🎉
