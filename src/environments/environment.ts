// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  guilloche: {
    colors: {
      start: '#cc0045',
      end: '#0067cc'
    }
  },
  controls: {
    wheelStep: 0.01
  },
  formDefaults: {
    width: 9,
    height: 16,
    vectors: {
      start: 1,
      end: 0,
      range: 0.3
    },
    nodes: 3,
    stroke: 1,
    scale: 0.1,
    overlap: 1.4,
    spread: 4
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
