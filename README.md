<div align="center">
  <img src="https://user-images.githubusercontent.com/10194510/44956832-63746780-aeca-11e8-85a4-09fa8138e659.png" alt="Random Guilloche Generator" height="300" />
</div>

<h1 align="center"><strong>Random Guilloche Generator</strong></h1>

<div align="center">
  <a href="https://npmjs.org/package/nls-guilloche">
    <img src="https://badgen.now.sh/npm/v/nls-guilloche" alt="version" />
  </a>
</div>

> DEPRECATED: This version of the guilloche generator is not anymore maintained. Feel free do use it, but with caution. This package has been replaced by [spline-generator](//github.com/nextlevelshit/spline-generator)

# Getting started

## 1) Add dependency to your project

```bash
# npm
npm install nls-guilloche --save

# yarn
yarn add nls-guilloche
```

## 2) Import module to your Angular application

```ts
// app.module.ts (default filename)

import { NlsGuillocheModule } from 'nls-guilloche';

@NgModule({
  declarations: [
    // ...
  ],
  imports: [
    // ...
    NlsGuillocheModule
  ],
  providers: [
    // ...
  ],
  bootstrap: [
    // ...
  ]
})
export class AppModule { }
```

## 3) Set up your configuration

```ts
// e.g. app.component.html
this.graph = {
  colors: {
    primary: '#ff005e',  //---| color of first graph in hexadecimal
    secondary: '#00d0c6'  // -| color of second graph in hexadecimal
  },
  margin: {
    x: 0, // -----------------| margin to parent container edges on x-axis
    y: 60  // ----------------| margin to parent container edges on x-axis
  }, 
  overlap: 0.6,  // ----------| generated nodes overlap parent container in percent
  vectors: {
    start: 0.5,  // ----------| direction of starting vector (Radians, 0 = up, 1 = down)
    end: 0,  // --------------| direction of ending vector (Radians, 0.5 = right, 1.5 = left)
    range: 0.3,  // ----------| directional starting/ending vector weight in percent
    spacing: 7  // -----------| spacing between graphs in starting/ending position
  },
  nodes: 4,  // --------------| amount of generated nodes
  stroke: 1,  // -------------| stroke width of graphs
  spread: {
    amount: 60,  // ----------| amount of cloned and spread graphs
    spacing: 20  // ----------| spacing between spread graphs
  }
};
this.isAnimated = true;
```

## 4) Implement directive in your template

Past in the configuration and set animation to `true` or `false` (default is `false`):

```html
<nls-graphs [config]="graph" [animation]="true"></nls-graphs>
```

## Usage only

## Active Development (Advanced)

### Rquirements

- Node.js
- Angular CLI

### NPM Scripts

| command          | description                                                     |
|------------------|-----------------------------------------------------------------|
| `npm run start`  | start development server on `http://localhost:4200/`            |
| `npm run build`  | build production application and save to `./dist`               |
| `npm run build:library` | build node module and save to `./dist/NlsGuilloche`      | 

## Author

The author of this software is Michael Czechowski, web developer based in Stuttgart and Berlin, Germany. Only with the support of two very talented web developers, Erik Kimsey and Martin Maga, this software could be realized. We are proud to mention that we can present this software as free software.

## Contributors

- [Michael Czechowski](//github.com/nextlevelshit) (<mail@dailysh.it>)
- Erik Kimsey
- [Martin Maga](//github.com/qualiacode)

## License

Copyright (C) 2018 Michael Czechowski

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; version 2.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
