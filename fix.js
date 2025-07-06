import fs from 'fs'
import path from 'path'

const packagePath = path.resolve('node_modules/joy-con-webhid/package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

packageJson.exports = {
	".": {
		"import": "./src/index.ts"
	}
}

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
