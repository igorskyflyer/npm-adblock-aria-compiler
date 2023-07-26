# Aria

Adblock template (ADBT) compiler

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

Pass the input ADBT template file.

<br>

Short: `-f`  
Long: `--file`  
Accepts: `path: string`  
Required: **yes**

Example

```shell
aria -f './my-template.adbt'
```

> 💡 Templates files _should_ end with the `.adbt` extension.

<br>
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

> 💡 The template **will not** be compiled; Aria will only print out the log.

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

> 💡 The template **will** be compiled and Aria will log while compiling.

> ❗ If you only want to do a dry-run and don't compile the template, then use the [`dry`](#dry) flag.
