import env from '#start/env'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME', 'foodsync'),
      level: env.get('LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(
            env.get('NODE_ENV') === 'development',
            targets.pretty({
              colorize: true,
            })
          )
          .toArray(),
      },
    },
  },
})

export default loggerConfig
