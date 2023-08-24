## 📒 Changelog

### of [@igor.dvlpr/aria](https://github.com/igorskyflyer/npm-adblock-aria-compiler/)

<br>

## 1.6.0 - 22-Aug-2023

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

> You can read more about [Actions](https://github.com/igorskyflyer/file-format-adbt#actions) in the official ADBT documentation.

<br>

## 1.5.0 - 20-Aug-2023

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

## 1.4.0 - 19-Aug-2023

### [ADBT v1.1.0](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.1.0)

- **🪅 feat**: support for Expires meta variable ([#38](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/38))

### CLI

- **🪅 feat**: log changes of the export file ([#36](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/36))
- **💻 dev**: remove **`value`** property for placeholders

<br>

## 1.3.0 - 14-Aug-2023

- **🪅 feat**: add support for absolute paths for header, include and export ([#30](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/30))
- **✅ fix**: literal versioning type leak into the exported file ([#32](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/32))
- **✅ fix**: don't trigger unreachable code warning for whitespace at the end of file ([#34](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/34))
- **💻 dev**: upgrade [@igor.dvlpr/zing](https://www.npmjs.com/package/@igor.dvlpr/zing)

<br>

## 1.2.5 - 02-Aug-2023

- **✅ fix**: always output absolute export path
- **🪅 feat**: log execution time ([#28](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/28))
- **🪅 feat**: use [ADBT v1.0.1](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.0.1)
  - **🪅 feat**: unreachable code detection
- **📜 docs**: update ADBT API link

<br>

## 1.2.4 - 02-Aug-2023

- **💻 dev**: use automated version tagging

<br>

## 1.2.3 - 02-Aug-2023

- **✅ fix**: incorrect CLI version

<br>

## 1.2.2 - 02-Aug-2023

- **✅ fix**: enable passing of relative template paths while using a `root` absolute path ([#24](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/24))

<br>

## 1.2.1 - 02-Aug-2023

- **📜 docs**: update API

<br>

## 1.2.0 - 02-Aug-2023

- **🪅 feat**: root directory option
- **✅ fix**: cwd path ([#23](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/23))

<br>

## 1.1.2 - 02-Aug-2023

- **✅ fix**: sourceline wrong numbering ([#18](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/18))
- **✅ fix**: String escaping ([#17](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/17))

## 1.1.1 - 01-Aug-2023

- **✅ fix**: version placeholder was injected even when a version is defined ([#14](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/14))
- **✅ fix**: don't prepend whitespace when injecting headers ([#12](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/12))

<br>

## 1.1.0 - 31-Jul-2023

- **🪅 feat**: don't include already included filter lists ([#10](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/10))

<br>

## 1.0.3 - 29-Jul-2023

- **✅ fix**: handle single quotes `'` in file paths ([#8](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/8))

<br>

## 1.0.2 - 29-Jul-2023

- **🪅 feat**: add performance information to CLI output

<br>

## 1.0.1 - 28-Jul-2023

- **✅ fix**: encode all files as UTF-8 ([#4](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/4))
- **✅ fix**: meta and compile variables mixup ([#6](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/6))
- **💻 dev**: upgrade TypeScript

<br>

## 1.0.0 - 27-Jul-2023

- **🚀 launch**: initial release 🎉
