import env from '#start/env'

export default {
  /*
  |--------------------------------------------------------------------------
  | Application name
  |--------------------------------------------------------------------------
  */
  appName: env.get('APP_NAME', 'FoodSync'),

  /*
  |--------------------------------------------------------------------------
  | Application secret key
  |--------------------------------------------------------------------------
  */
  appKey: env.get('APP_KEY'),

  /*
  |--------------------------------------------------------------------------
  | HTTP server settings
  |--------------------------------------------------------------------------
  */
  http: {
    generateRequestId: true,
    allowMethodSpoofing: false,
    useAsyncLocalStorage: false,
    cookie: {},
    qs: {
      parse: {},
    },
  },
}
