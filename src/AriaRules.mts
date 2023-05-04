export const AriaRules = {
  comment: /!!(.*)/,
  headerImport: /\$\s+'?([^']*)'?/i,
  import: /\*\s+'?([^']*)'?/i,
  export: /\>\s+'?([^']*)'?/i,
  flagsImport: /-(if|rulesOnly)/gi,
  flagsExport: /-(dedupe|sort|bydate)/gi,
} as const
