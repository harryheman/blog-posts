#!/usr/bin/env node
import yargs from 'yargs'
import main from './main.js'

yargs
  .usage('my-yarn <command> [args]')
  .version()
  .alias('v', 'version')
  .help()
  .alias('h', 'help')
  .command(
    'add',
    'Install dependencies',
    (argv) => {
      argv.option('production', {
        type: 'boolean',
        description: 'Install production dependencies only'
      })

      argv.boolean('save-dev')
      argv.boolean('dev')
      argv.alias('D', 'dev')

      return argv
    },
    main
  )
  .parse()
