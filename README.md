# create-react-rollup

Package to create React apps using Rollup.

_Warning: this package is not ready to using in production!_

## Quick overview

To create new React app 
```sh
npx create-react-rollup <app-name>
cd <app-name>
npm start
```

This will create the next project structure:

```sh
app-name
├─ node_modules
├─ package.json
├─ rollup.config.js
├─ public
│  ├─ index.html
│  ├─ index.js
│  ├─ index.js.map
│  └─ style.css
└─ src
   ├─ index.js
   └─ components
      ├─ App
      │  ├── App.module.css
      │  ├── index.js
      └─ Title
         └── index.js
```

Then open http://localhost:3000/ to see your app.

If you are ready to deploy, you can sipmy do it using `npm run build`

## Todo functionality

- [ ] Typescript support
- [ ] Redux support
- [ ] Init Git repo
- [ ] More info in console output