## 📒 Changelog

### of [@igor.dvlpr/aria](https://github.com/igorskyflyer/npm-adblock-aria-compiler/)

<br>

## v2.3.0

<p align="right"><em>15-Jul-2024</em></p>

- **🪅 feat**: add an auto-generated header to the compiled filter list file ([#124](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/124))

<br>

- **✅ fix**: don't add the version metadata if no header is present ([#125](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/125))

<br>
<br>

## v2.2.0

<p align="right"><em>15-Jul-2024</em></p>

### [ADBT v2.1.0](https://github.com/adbt-lang/adbt/releases/tag/v2.1.0)

- **🪅 feat**: add the **`implement`** statement ([implement statement](https://github.com/adbt-lang/adbt#header) in ADBT)
- **🪅 feat**: log unsupported Actions ([#119](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/119))
- **🪅 feat**: disallow duplicate Actions ([#110](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/110))
- **🪅 feat**: log applied Actions ([#114](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/114))
- **🪅 feat**: add final newline when exporting ([#108](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/108))
- **🪅 feat**: support multiple actions per include/import ([#106](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/106))
- **🪅 feat**: detect trailing comma for Actions ([#121](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/121))
- **🪅 feat**: implement a custom diff algorithm for changes to compiled files
- **🪅 feat**: resolve meta early (performance gain)
- **🪅 feat**: allow only 1 `implement` per `ADBT` template

<br>

- **✅ fix**: meta and compiler var replacement leak ([#123](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/123))
- **✅ fix**: don't parse Actions for duplicate includes/imports ([#111](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/111))
- **✅ fix**: fix multiple Actions overwrite ([#112](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/112))
- **✅ fix**: fix message logging
- **✅ fix**: log line number when throwing an `implement` exception
- **✅ fix**: rename wrongly named resource string
- **✅ fix**: fix parsing and replacing of meta variables
- **✅ fix**: fix parsing and replacing of compile variables

<br>

- **💻 dev**: remove `subnodes` property of `IAriaNode`

<br>
<br>

## v2.1.0

<p align="right"><em>13-Sep-2023</em></p>

- **🪅 feat**: log line number of an already included filter file ([#102](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/102))

<br>

- **✅ fix**: add a newline when transforming source only when needed ([#98](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/98))
- **✅ fix**: sort actions strips final newline ([#96](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/96))

<br>

- **💻 dev**: make external meta message an info, not a warning ([#100](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/100))

<br>
<br>

## v2.0.1

<p align="right"><em>31-Aug-2023</em></p>

- **✅ fix**: inline meta erasing external metadata ([#94](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/94))

<br>
<br>

## v2.0.0

<p align="right"><em>31-Aug-2023</em></p>

### [ADBT v2.0.0](https://github.com/adbt-lang/adbt/releases/tag/v2.0.0)

- **🪅 feat** **\[BREAKING]**: enforce order of statements ([#60](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/60))

> 💡 Keeps track of order of statements (nodes) in the input template and enforces rules, thus keeping the integrity and validity of the exported Adblock filter file.

The following rules are enforced:

- a [`header`](https://github.com/adbt-lang/adbt#header) statement cannot appear after a [`meta`](https://github.com/adbt-lang/adbt#meta) statement,
- a [`header`](https://github.com/adbt-lang/adbt#header) statement cannot appear after an [`include`](https://github.com/adbt-lang/adbt#include)/[`import`](https://github.com/adbt-lang/adbt#import) statement,
- a [`meta`](https://github.com/adbt-lang/adbt#meta) statement cannot appear after an [`include`](https://github.com/adbt-lang/adbt#include)/[`import`](https://github.com/adbt-lang/adbt#import) statement,
- **`no statements`** can appear after an [`export`](https://github.com/adbt-lang/adbt#export) statement.

  Will `throw` when order is not correct.

- **🪅 feat**: add info logging method ([#86](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/86))
- **🪅 feat**: log presence of inline meta ([#84](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/84))
- **🪅 feat**: validate statements, catch edge-cases ([#82](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/82))
- **🪅 feat**: detect and warn when no header/metadata is present ([#80](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/80))
- **🪅 feat**: evaluate statements eagerly ([#74](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/74))
- **🪅 feat**: reorganize order of nodes detection by usage/order of statements ([#72](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/72))
- **🪅 feat**: add [`meta`](https://github.com/metaigorskyflyer/file-format-adbt#meta) statement and support for inline meta ([#68](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/68))
  > 💡 Has highest priority when setting metadata.
- **🪅 feat**: always amend the `Expires` field of the metadata of the compiled filter file ([#66](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/66))
- **🪅 feat**: always add `Entries` field to the metadata of the compiled filter file ([#64](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/64))
- **🪅 feat**: make all user input paths universal, i.e. allow all OS' to use a forward slash (_"`/`"_) as the path separator ([#62](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/62))

  > _🌟 Via [uPath](https://www.npmjs.com/package/@igor.dvlpr/upath)_

- **🪅 feat**: detect unsupported identifiers/code ([#58](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/58))

<br>

- **✅ fix**: change warning text background color
- **✅ fix**: log unsupported identifiers ([#76](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/76))
- **✅ fix**: refactor nodes logging ([#70](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/70))
- **✅ fix**: import paths not being tracked ([#56](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/56))
- **✅ fix**: actions remove final newline ([#54](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/54))
- **✅ fix**: filter path not available in logs ([#52](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/52))
- **✅ fix**: fix messages formatting ([#88](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/88))
- **✅ fix**: various fixes to strings used in logging

<br>

- **💻 dev**: invert node orders ([#78](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/78))
- **💻 dev**: externalize strings ([#90](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/90))
- **💻 dev**: add tests and coverage

<br>
<br>

## v1.6.1

<p align="right"><em>22-Aug-2023</em></p>

- **✅ fix**: fix an error when no action is provided, ([#50](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/50))
- **✅ fix**: fix an error when passing multiple values for error logging, ([#51](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/51))

<br>
<br>

## v1.6.0

<p align="right"><em>22-Aug-2023</em></p>

### [ADBT v1.3.0](https://github.com/adbt-lang/adbt/releases/tag/v1.3.0)

- **🪅 feat**: add support for statement actions ([#48](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/48)), currently available for:
  - [**`include`**](https://github.com/adbt-lang/adbt#include),
  - [**`import`**](https://github.com/adbt-lang/adbt#import)

<br>
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

> You can read more about [Actions](https://github.com/adbt-lang/adbt#-actions) in the official ADBT documentation.

<br>
<br>

## v1.5.0

<p align="right"><em>20-Aug-2023</em></p>

### [ADBT v1.2.0](https://github.com/adbt-lang/adbt/releases/tag/v1.2.0)

- **🪅 feat**: implement the **`import`** statement ([#45](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/45))
  > **`import`** statements behave exactly the same as **`include`** but prepend the file path of the included filter (as a comment)
- **🪅 feat**: implement the **`tag`** statement ([#40](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/40))
  > Introduce a tagging system; special comments that get inserted in the resulting filter file, for easier navigation, search, etc.
  >
  > _🌟 Inspired by [AdVoid](https://github.com/igorskyflyer/ad-void)'s way of navigation._

### CLI

- **✅ fix**: when passing the **`-t`** flag, the input template wasn't being compiled

<br>
<br>

## v1.4.0

<p align="right"><em>19-Aug-2023</em></p>

### [ADBT v1.1.0](https://github.com/adbt-lang/adbt/releases/tag/v1.1.0)

- **🪅 feat**: support for Expires meta variable ([#38](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/38))

### CLI

- **🪅 feat**: log changes of the export file ([#36](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/36))

<br>

- **💻 dev**: remove **`value`** property for placeholders

<br>
<br>

## v1.3.0

<p align="right"><em>14-Aug-2023</em></p>

- **🪅 feat**: add support for absolute paths for header, include and export ([#30](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/30))

<br>

- **✅ fix**: literal versioning type leak into the exported file ([#32](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/32))
- **✅ fix**: don't trigger unreachable code warning for whitespace at the end of file ([#34](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/34))

<br>

- **💻 dev**: upgrade [@igor.dvlpr/zing](https://www.npmjs.com/package/@igor.dvlpr/zing)

<br>
<br>

## v1.2.5

<p align="right"><em>02-Aug-2023</em></p>

### [ADBT v1.0.1](https://github.com/adbt-lang/adbt/releases/tag/v1.0.1)

- **🪅 feat**: log execution time ([#28](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/28))
- **🪅 feat**: unreachable code detection

<br>

- **✅ fix**: always output absolute export path

<br>

- **📜 docs**: update ADBT API link

<br>
<br>

## v1.2.4

<p align="right"><em>02-Aug-2023</em></p>

- **💻 dev**: use automated version tagging

<br>
<br>

## v1.2.3

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: incorrect CLI version

<br>
<br>

## v1.2.2

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: enable passing of relative template paths while using a `root` absolute path ([#24](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/24))

<br>
<br>

## v1.2.1

<p align="right"><em>02-Aug-2023</em></p>

- **📜 docs**: update API

<br>
<br>

## v1.2.0

<p align="right"><em>02-Aug-2023</em></p>

- **🪅 feat**: root directory option

<br>

- **✅ fix**: cwd path ([#23](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/23))

<br>
<br>

## v1.1.2

<p align="right"><em>02-Aug-2023</em></p>

- **✅ fix**: sourceline wrong numbering ([#18](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/18))
- **✅ fix**: String escaping ([#17](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/17))

<br>
<br>

## v1.1.1

<p align="right"><em>01-Aug-2023</em></p>

- **✅ fix**: version placeholder was injected even when a version is defined ([#14](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/14))
- **✅ fix**: don't prepend whitespace when injecting headers ([#12](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/12))

<br>
<br>

## v1.1.0

<p align="right"><em>31-Jul-2023</em></p>

- **🪅 feat**: don't include already included filter lists ([#10](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/10))

<br>
<br>

## v1.0.3

<p align="right"><em>29-Jul-2023</em></p>

- **✅ fix**: handle single quotes `'` in file paths ([#8](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/8))

<br>
<br>

## v1.0.2

<p align="right"><em>29-Jul-2023</em></p>

- **🪅 feat**: add performance information to CLI output

<br>
<br>

## v1.0.1

<p align="right"><em>28-Jul-2023</em></p>

- **✅ fix**: encode all files as UTF-8 ([#4](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/4))
- **✅ fix**: meta and compile variables mixup ([#6](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/6))

<br>

- **💻 dev**: upgrade TypeScript

<br>
<br>

## v1.0.0

<p align="right"><em>27-Jul-2023</em></p>

### [ADBT v1.0.0](https://github.com/adbt-lang/adbt/releases/tag/v1.0.0)

- **🚀 launch**: initial release 🎉
