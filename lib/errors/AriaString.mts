export const AriaString = {
  native: {
    id: '000',
    message: '{0}',
  },
  noTemplate: {
    id: '001',
    message: 'no valid template path provided',
  },
  templateMissing: {
    id: '002',
    message: 'missing template path',
  },
  extraneousInput: {
    id: '003',
    message: 'extraneous input found after the string "{0}"',
  },
  expectedString: {
    id: '004',
    message: 'expected a valid string but found "{0}"',
  },
  unterminatedString: {
    id: '005',
    message: 'unterminated string',
  },
  oneExportOnly: {
    id: '006',
    message: 'only 1 export can exist per template',
  },
  headerRead: {
    id: '007',
    message: 'couldn\'t read the header file located at: "{0}"',
  },
  headerNotFound: {
    id: '008',
    message: 'the header "{0}" doesn\'t exist',
  },
  filterRead: {
    id: '009',
    message: 'couldn\'t read the filter file located at: "{0}"',
  },
  filterNotFound: {
    id: '010',
    message: 'the filter file "{0}" doesn\'t exist',
  },
  exportInvalid: {
    id: '011',
    message: 'invalid export path',
  },
  exportNotSpecified: {
    id: '012',
    message: "the template doesn't contain a single, valid file export path",
  },
  exportUnsuccessful: {
    id: '013',
    message: 'couldn\'t export to file "{0}"',
  },
  includedAlready: {
    id: '014',
    message:
      "filter file '{0}' was already included. Consider removing this include.",
  },
  unreachableNodes: {
    id: '015',
    message:
      "unreachable code detected after line {0}. A template can only end with an export statement. Consider removing it or reorganizing the template's code.",
  },
  actionNoParam: {
    id: '016',
    message:
      'action {0} requires a value for its parameter but none was provided.',
  },
  actionInvalidParam: {
    id: '017',
    message: 'invalid param value for {0} action, allowed values: {1}',
  },
  actionUnknownAction: {
    id: '018',
    message: 'unknown action "{0}"',
  },
  syntaxError: {
    id: '019',
    message: 'syntax error, unsupported identifier "{0}"',
  },
  syntaxOrder: {
    id: '020',
    message: 'syntax error, "{0}" is not allowed after "{1}"',
  },
  metaInvalidValue: {
    id: '021',
    message: 'no value provided for the meta',
  },
  metaInvalidProp: {
    id: '022',
    message: 'invalid meta property {0}',
  },
  headerMissing: {
    id: '023',
    message:
      'no header statement found, consider adding one since metadata is required for an Adblock filter file to be valid.',
  },
  nodeLogHeader: {
    id: '024',
    message: 'Found a header import',
  },
  nodeLogMeta: {
    id: '025',
    message: 'Found a meta',
  },
  nodeLogInclude: {
    id: '026',
    message: 'Found an include',
  },
  nodeLogImport: {
    id: '027',
    message: 'Found an import',
  },
  nodeLogNewline: {
    id: '028',
    message: 'Found an explicit new line',
  },
  nodeLogInternalComment: {
    id: '029',
    message: 'Found an internal comment, skipping line',
  },
  nodeLogExportedComment: {
    id: '030',
    message: 'Found an exported comment',
  },
} as const
