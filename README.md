# Aria 🪅

Adblock template (`ADBT`) compiler

<div align="center">
	<img src="https://raw.githubusercontent.com/igorskyflyer/npm-adblock-aria-compiler/main/assets/aria.png" alt="Aria compiler">
	<br>
<em>🧬 Meet <code>Aria</code>, an efficient Adblock filter list compiler, with many features that make your maintenance of Adblock filter lists a breeze! 🗡</em>
</div>

<br>
<br>

<div align="center">
<h3>💖 Support further development</h3>
<a href="https://ko-fi.com/igorskyflyer" target="_blank"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Donate to igorskyflyer" width="108"></a>
</div>

<br>
<br>
<br>

## 🕵🏼‍♂️ Install

Install it by executing:

Global install

```shell
npm i -g "@igor.dvlpr/aria"
```

<br>

Local install

```shell
npm i "@igor.dvlpr/aria"
```

<br>

## 🤹🏼‍♂️ Usage

💡 This file only documents `Aria CLI`-related API.

You should read the official [ADBT API](https://github.com/igorskyflyer/file-format-adbt/releases/latest) documentation for more information on how ADBT works, its syntax and usage.

<br>

### 🪄 Arguments

<br>

`<None>`

<div align="center">
	<img src="https://raw.githubusercontent.com/igorskyflyer/npm-adblock-aria-compiler/main/assets/screenshots/aria-cli.png" alt="Aria - Adblock template compiler CLI">
<em>Will print the welcome + help screen</em>
</div>

<br>
<br>

#### `File`

Compile the input ADBT template file.

<br>

Short: `-f`  
Long: `--file`  
Accepts: `path: string`  
Required: **yes**

Example

```shell
aria -f './my-template.adbt'
```

> 💡 Template files _should_ end with the `.adbt` extension.

<br>
<br>

#### `Versioning`

The versioning to use, can be:

- `auto`: **default**, let `Aria` decide which versioning system to use.  
  If the resulting file already exists, i.e. `Aria` already compiled the template before, it will re-use the versioning found in the file, otherwise it will use `semver`,

- `semver`: use valid SemVer versioning when exporting the filter file, e.g. `v1.0.0`, `v2.199.222`, etc.  
  If no version is found the counting starts with `v1.0.0`,

- `timestamp`: use current UNIX timestamp, e.g. `1690409508`.

<br>

Short: `-v`  
Long: `--versioning`  
Accepts: `auto`, `semver`, `timestamp`  
Required: **no**

Example

```shell
aria -f './my-template.adbt' -v semver
```

<br>
<br>

> ℹ️ Versioning in Adblock filters
>
> Take this snippet from my [AdVoid](https://github.com/igorskyflyer/ad-void) filter list:

```
! Title: AdVoid.Core
! Description: ✈ AdVoid is an efficient AdBlock filter that blocks ads! 👾
! Version: 1.8.1082
```

`Aria` takes care of the versioning, the last line you see in the snippet above - so you don't have to!

<br>

> ❗When using SemVer as the versioning system, `Aria` **will** always increase **only** the `patch` component of the version.

<br>

### 🪅 Flags

#### `Dry`

Do a dry-run and print the resulting AST.

<br>

Short: `-d`  
Long: `--dry`  
Accepts: `N/A`  
Required: **no**

Example

```shell
aria -f './my-template.adbt' -d
```

> 💡 The template **will not** be compiled; `Aria` will only print out the log.

> ❗ If you want to both compile and print the log, then use the [`log`](#log) flag.

<br>
<br>

#### `Tree`

Will print the resulting AST.

<br>

Short: `-t`  
Long: `--tree`  
Accepts: `N/A`  
Required: **no**

Example

```shell
aria -f './my-template.adbt' -t
```

> 💡 This **will** compile and print out the resulting AST.

<br>

> 🤔 What is AST?
>
> _In computer science, an abstract syntax tree (AST), or just syntax tree, is a tree representation of the abstract syntactic structure of text (often source code) written in a formal language. Each node of the tree denotes a construct occurring in the text._ – Wikipedia

<br>
<br>

#### `Log`

Enable compilation logging.

<br>

Short: `-l`  
Long: `--log`  
Accepts: `N/A`  
Required: **no**

Example

```shell
aria -f './my-template.adbt' -l
```

> 💡 The template **will** be compiled and `Aria` will log while compiling.

> ❗ If you only want to do a dry-run and don't compile the template, then use the [`dry`](#dry) flag.

<br>
<br>

#### `Help`

Show the welcome + help screen.

<br>

Short: `-h`  
Long: `--help`  
Accepts: `N/A`  
Required: **no**

Example

```shell
aria --help
```

> 💡 This flag works the same as calling `aria` on its own - with 0 arguments.
