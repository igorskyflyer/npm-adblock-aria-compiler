export const AriaException = {
  native: { id: '000', message: '{0}' },
  noTemplate: { id: '001', message: 'no valid template path provided.' },
  extraneousInput: { id: '002', message: 'extraneous input found after the import path "{0}".' },
  importPath: { id: '003', message: `expected a string path for import but found "{0}...".` },
  unterminatedPath: { id: '004', message: 'unterminated file path string.' },
  oneExportOnly: { id: '005', message: 'only 1 export can exist per template.' },
} as const