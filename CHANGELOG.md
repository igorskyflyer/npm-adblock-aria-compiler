## 📒 Changelog

### of [@igor.dvlpr/aria](https://github.com/igorskyflyer/npm-adblock-aria-compiler/)

<br>

## 1.4.0 - 19-Aug-2023

- **🪅 feat**: use [ADBT v1.1.0](https://github.com/igorskyflyer/file-format-adbt/releases/tag/v1.1.0) which brings:
  - **🪅 feat**: support for Expires meta variable ([#38](https://github.com/igorskyflyer/npm-adblock-aria-compiler/issues/38))
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
