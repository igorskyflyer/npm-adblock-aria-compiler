import chalk from 'chalk'

export const AriaErrorString = {
  native: {
    id: '000',
    message: 'Native: {0}'
  },
  noTemplate: {
    id: '001',
    message: 'No valid template path provided.'
  },
  templateMissing: {
    id: '002',
    message: 'Missing template path.'
  },
  extraneousInput: {
    id: '003',
    message: 'Extraneous input found after the string "{0}".'
  },
  expectedString: {
    id: '004',
    message: 'Expected a valid string but found "{0}".'
  },
  unterminatedString: {
    id: '005',
    message: 'Unterminated string.'
  },
  oneExportOnly: {
    id: '006',
    message: 'Only 1 export can exist per template.'
  },
  headerRead: {
    id: '007',
    message: 'Couldn\'t read the header file located at: "{0}".'
  },
  headerNotFound: {
    id: '008',
    message: 'The header "{0}" doesn\'t exist.'
  },
  filterRead: {
    id: '009',
    message: 'Couldn\'t read the filter file located at: "{0}".'
  },
  filterNotFound: {
    id: '010',
    message: 'The filter file "{0}" doesn\'t exist.'
  },
  exportInvalid: {
    id: '011',
    message: 'Invalid export path.'
  },
  exportNotSpecified: {
    id: '012',
    message: "The template doesn't contain a single, valid file export path."
  },
  exportUnsuccessful: {
    id: '013',
    message: 'Couldn\'t export to file "{0}".'
  },
  includedAlready: {
    id: '014',
    message:
      'Filter file "{0}" found at line {1} was ignored because it was already included. Consider removing this include.'
  },
  unreachableNodes: {
    id: '015',
    message:
      "Unreachable code detected after line {0}. A template can only end with an export statement. Consider removing it or reorganizing the template's code."
  },
  actionNoParam: {
    id: '016',
    message:
      'Action "{0}" requires a value for its parameter but none was provided.'
  },
  actionInvalidParam: {
    id: '017',
    message: 'Invalid param value for "{0}" action, allowed values: "{1}".'
  },
  actionUnknownAction: {
    id: '018',
    message: 'Unknown action "{0}".'
  },
  syntaxError: {
    id: '019',
    message: 'Syntax error, unsupported identifier "{0}".'
  },
  syntaxOrder: {
    id: '020',
    message: 'Syntax error, "{0}" is not allowed after "{1}".'
  },
  metaInvalidValue: {
    id: '021',
    message: 'No value provided for meta.'
  },
  metaInvalidProp: {
    id: '022',
    message: 'Invalid meta property "{0}".'
  },
  headerMissing: {
    id: '023',
    message:
      'No header statement found, consider adding one since metadata is required for an Adblock filter file to be valid.'
  },
  nodeLogHeader: {
    id: '024',
    message: 'Found a header import.'
  },
  nodeLogMeta: {
    id: '025',
    message: 'Found a meta.'
  },
  nodeLogInclude: {
    id: '026',
    message: 'Found an include.'
  },
  nodeLogImport: {
    id: '027',
    message: 'Found an import.'
  },
  nodeLogNewline: {
    id: '028',
    message: 'Found an new line.'
  },
  nodeLogInternalComment: {
    id: '029',
    message: 'Found an internal comment, skipping line.'
  },
  nodeLogExportedComment: {
    id: '030',
    message: 'Found an exported comment.'
  },
  nodeLogTag: {
    id: '031',
    message: 'Found a tag.'
  },
  nodeLogExport: {
    id: '032',
    message: 'Found an export.'
  },
  logNoChanges: {
    id: '033',
    message: 'no changes'
  },
  abortCompilation: {
    id: '034',
    message: 'Aborting the compilation...'
  },
  actionApplying: {
    id: '035',
    message: 'Applying {0} action to "{1}"...'
  },
  actionDuplicate: {
    id: '036',
    message: 'Duplicate {0} action, ignoring the new occurrence.'
  },
  actionTrailingComma: {
    id: '037',
    message: 'Trailing comma for the Action found on line {0}.'
  },
  nodeLogImplement: {
    id: '038',
    message: 'Found an implement.'
  },
  oneImplementOnly: {
    id: '039',
    message: 'Only 1 implement can exist per template.'
  },
  recursiveImplement: {
    id: '040',
    message: 'A template file cannot implement itself.'
  },
  implementNotFound: {
    id: '041',
    message: 'The referenced template file to implement cannot be found.'
  },
  resolvedMeta: {
    id: '042',
    message: 'Resolved external meta: {0}'
  },
  metaFileRecommendation: {
    id: '043',
    message: `${chalk.dim(
      `Meta file could not be resolved, if necessary, create a file named ${chalk.bold.white(
        '{0}'
      )} for extra customizability of the output filter file.`
    )}`
  },
  resolvedMetaFile: {
    id: '044',
    message: 'Resolved root directory: {0}'
  },
  resolvedTemplate: {
    id: '045',
    message: 'Resolved template: {0}'
  }
} as const
