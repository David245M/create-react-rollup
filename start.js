const fs = require('fs-extra')
const util = require('util')
const Listr = require('listr')
const { projectInstall } = require('pkg-install')
const exec = util.promisify(require('child_process').exec)

const npmOptions = {
  scripts: {
    start: 'rollup -c -w',
    build: 'rollup -c',
  },
}

export async function createProject(args) {
  const [, rawFrom, directory] = args
  const from = rawFrom.split('\\').slice(0,-2).join('\\')

  const tasks = new Listr([
    {
      title: 'Creating new directory',
      task: async () => {
        if (!directory) {
          return Error('Please provide directory name and try again.')
        }

        if (fs.existsSync(directory)) {
          return Error(`Directory ${directory} is alredy exists! Remove it or choose another name for app and try again.`)
        }
        await fs.mkdir(directory)
        return `Directory ${directory} has created.`
      }
    },
    {
      title: 'Copying files to new directory',
      task: async () => {
        // creating subdirectories...
        await fs.mkdir(`${directory}/public`)
        await fs.mkdir(`${directory}/src`)
  
        // and copy files into them
        await fs.copy(`${from}/public`,`${directory}/public`)
        await fs.copy(`${from}/src`, `${directory}/src`)
        await fs.copyFile(`${from}/rollup.config.js`, `${directory}/rollup.config.js`)
        return 'Copied!'
      }
    },
    {
      title: 'Project initialization',
      task: async () => {
        // getting current (dev-) dependencies
        const devPack = await fs.readFile(`${from}/package.json`)
        let { dependencies, devDependencies } = JSON.parse(devPack)
        dependencies = {
          'react': dependencies['react'],
          'react-dom': dependencies['react-dom'],
        }

        await exec(`npm init -y`, {
          cwd: directory,
        })

        const pack = await fs.readFile(`${directory}/package.json`)
        const packJSON = JSON.parse(pack.toString())
        const packWithScripts = JSON.stringify({
          ...packJSON,
          ...npmOptions,
          dependencies,
          devDependencies,
        }, null, '\t')
        await fs.writeFile(`${directory}/package.json`, packWithScripts)
      }
    },
    {
      title: 'Installing dependencies',
      task: async () => await projectInstall({ cwd: directory })
    }
  ])

  return await tasks.run()
}