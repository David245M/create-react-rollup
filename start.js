const fs = require('fs-extra')
const path = require('path')
const util = require('util')
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

  if (!directory) {
    console.error('Please provide directory name and try again.')
    return
  }

  try {
    if (fs.existsSync(directory)) {
      console.error(`Directory ${directory} is alredy exists! Remove it or choose another name for app and try again.`)
      return
    }
    await fs.mkdir(directory)
    console.log(`Directory ${directory} has created.`)

    // creating subdirectories...
    await fs.mkdir(`${directory}/public`)
    await fs.mkdir(`${directory}/src`)

    // and copy files into them
    await fs.copy(`${from}/public`,`${directory}/public`)
    await fs.copy(`${from}/src`, `${directory}/src`)
    await fs.copyFile(`${from}/rollup.config.js`, `${directory}/rollup.config.js`)
    console.log('Files copied.')
    
    // getting current (dev-) dependencies
    const devPack = await fs.readFile(`${from}/package.json`)
    let { dependencies, devDependencies } = JSON.parse(devPack)
    dependencies = {
      'react': dependencies['react'],
      'react-dom': dependencies['react-dom'],
    }

    // initialization project
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
    console.log('Copy dependencies.')
    
    // installing dependencies 
    const x = await projectInstall({
      cwd: directory,
    })
  } catch (err) {
    console.error(err)
  }
}
  