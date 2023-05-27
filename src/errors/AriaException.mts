export const AriaException = {
  native: { id: '000', message: '{0}' },
  noTemplate: { id: '001', message: 'No valid template path provided.' },
  extraneousInput: { id: '002', message: 'Extraneous input found after the import path "{0}" at line {1}.' },
  importPath: { id: '003', message: `Expected a string path for import but found "{0}..." at line: {1}.` },
  unterminatedPath: { id: '004', message: 'Unterminated file path string at line {0}.' },
  oneExportOnly: { id: '005', message: 'Only 1 export can exist per template but found an additional at line {0}.' },
} as const
