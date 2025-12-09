import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  /**
   * The bodyparser middleware will parse the request body
   * for the following HTTP methods.
   */
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Config for the "application/x-www-form-urlencoded"
   * content-type parser
   */
  form: {
    convertEmptyStringsToNull: true,
    types: ['application/x-www-form-urlencoded'],
  },

  /**
   * Config for the JSON parser
   */
  json: {
    convertEmptyStringsToNull: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  /**
   * Config for the raw text parser
   */
  raw: {
    types: ['text/*'],
  },

  /**
   * Config for the multipart parser
   */
  multipart: {
    autoProcess: true,
    processManually: [],
    convertEmptyStringsToNull: true,
    types: ['multipart/form-data'],
    limit: '20mb',
  },
})

export default bodyParserConfig
