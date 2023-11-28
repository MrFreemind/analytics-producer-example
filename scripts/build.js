const path = require('path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');

const rootDir = path.dirname(__dirname);
const distFolder = `${rootDir}/garbage`;
const sourceDir = `${rootDir}/src`;

const isDir = (path) => {
    return !!fsSync.lstatSync(path).isDirectory();
}

fs.readdir(sourceDir)
    .then((files) => {
        console.log(files);
    })
    .catch((err) => {
        console.error(err);
    });

const initObject = {};

const getDirs = (path) => {
    return fs.readdir(path)
        .then((files) => {
            return files.filter((file) => {
                return isDir(`${path}/${file}`);
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

const getFiles = (path) => {
    return fs.readdir(path)
        .then((files) => {
            return files.filter((file) => {
                return !isDir(`${path}/${file}`);
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

const truncFileExtension = (fileName) => fileName.split('.')[0];

const parseFolder = async (path, folderName, dataObj) => {
    const nextPath = `${path}/${folderName}`;
    const dirs = await getDirs(nextPath);
    const files = await getFiles(nextPath);

    console.log('parseFolder', {
        nextPath, dirs,
        files
    })

    const filesWithoutExtension = files.map(truncFileExtension);
    const collision = filesWithoutExtension.find((file) => dirs.includes(file));
    if (!!collision) {
        throw new Error(`Collision detected in file name ${collision} in folder ${nextPath}`);
    }

    dataObj[folderName] = {};

    filesWithoutExtension.forEach((file) => {
        dataObj[folderName][file] = `${nextPath}/${file}`;
    });

    for (let dir of dirs) {
        await parseFolder(nextPath, dir, dataObj[folderName]);
    }
}

// on first level we only take folders

parseInitObject = (obj, folderName, folderPath) => {
    if (!fsSync.existsSync(folderPath)) {
        console.log(`Folder ${folderName} DOESNT exist`);
        fsSync.mkdirSync(folderPath, 0744);
    } else {
        console.log(`Folder ${folderName} exists`);
    }

    const files = [];
    const dirs = [];

    const objWithPath = obj[folderName]

    console.log({ objWithPath, obj, folderName })

    const resultFileContent = '';

    for (let key in objWithPath) {
        if (typeof objWithPath[key] === 'string') {
            files.push(key);
        } else {
            dirs.push(key);
        }
    }

    console.log({ files, dirs })

    const result = `
${files.map((file) => `import ${file} from './${file}';`).join('\n')}
${dirs.map((dir) => `import ${dir} from './${dir}';`).join('\n')}

export default {
    ${files.map((file) => `${file},`).join('\n')}
    ${dirs.map((dir) => `${dir},`).join('\n')}
}`

    console.log({ result })

    fsSync.writeFileSync(`${folderPath}/index.ts`, result);

    // copy files

    for (let file of files) {
        fsSync.copyFileSync(`${objWithPath[file]}.ts`, `${folderPath}/${file}.ts`);
    }

    for (let dir of dirs) {
        parseInitObject(objWithPath, dir, `${folderPath}/${dir}`);
    }
}
const start = async () => {
    const initialDirs = await getDirs(sourceDir);
    console.log({initialDirs})

    for (let dir of initialDirs) {
        await parseFolder(sourceDir, dir, initObject)
    }

    // compose index.ts into dist folder

    console.log('FINAL');
    console.log(initObject)

    // DEBUG??
    fsSync.rmSync(distFolder, {recursive: true, force: true});

    if (!fsSync.existsSync(distFolder)) {
        console.log('Dist folder DOESNT exist');
        fsSync.mkdirSync(distFolder, 0744);
    } else {
        console.log('Dist folder exists');
    }

    const initFolders = Object.entries(initObject).filter(([key, value]) => typeof value !== 'string').map(([key, value]) => key);

    console.log({ initFolders })

    for (let folder of initFolders) {
        const folderPath = `${distFolder}/${folder}`;

        parseInitObject(initObject, folder, folderPath)
    }

    // create index.ts file

    const result = `
${initFolders.map((folder) => `import ${folder} from './${folder}';`).join('\n')}

export default {
    ${initFolders.map((folder) => `${folder},`).join('\n')}
}`

    fsSync.writeFileSync(`${distFolder}/index.ts`, result);

    fsSync.copyFileSync(`${sourceDir}/createAnalyticsFunction.ts`, `${distFolder}/createAnalyticsFunction.ts`);

    console.log('DONE');
}


console.log({rootDir, sourceDir})

start();
