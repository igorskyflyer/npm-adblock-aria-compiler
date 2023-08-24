export const AriaException = {
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
  includePath: {
    id: '004',
    message: 'expected a string path for including but found "{0}"',
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
      "unreachable code detected after line {0}. A template can only end with an export statement. Consider removing or reorganizing the template's code.",
  },
  actionNoParam: {
    id: '016',
    message: 'action {0} requires a param value but none was provided.',
  },
  actionInvalidParam: {
    id: '017',
    message: 'invalid param value for {0} action, allowed values: {1}',
  },
  actionUnknownAction: {
    id: '018',
    message: 'unknown action: {0}',
  },
} as const
