import { IAriaExceptionInfo } from './IAriaExceptionInfo.mjs'

export const AriaException: Record<string, IAriaExceptionInfo> = {
  native: {
    id: '000',
    message: '{0}',
  },
  noTemplate: {
    id: '001',
    message: 'no valid template path provided',
  },
  extraneousInput: {
    id: '002',
    message: 'extraneous input found after the import path "{0}"',
  },
  importPath: {
    id: '003',
    message: `expected a string path for import but found "{0}...".`,
  },
  unterminatedPath: {
    id: '004',
    message: 'unterminated file path string',
  },
  oneExportOnly: {
    id: '005',
    message: 'only 1 export can exist per template',
  },
  headerRead: {
    id: '006',
    message: 'couldn\'t read the header file located at: "{0}"',
  },
  headerNotFound: {
    id: '007',
    message: 'the header "{0}" doesn\'t exist',
  },
  filterRead: {
    id: '008',
    message: 'couldn\'t read the filter file located at: "{0}"',
  },
  filterNotFound: {
    id: '009',
    message: 'the filter file "{0}" doesn\'t exist',
  },
  exportInvalid: {
    id: '010',
    message: 'invalid export path',
  },
  exportUnsuccessful: {
    id: '011',
    message: 'couldn\'t export to file "{0}"',
  },
} as const
