// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  guilloche: {
    colors: {
      start: '#cc0045',
      end: '#0067cc'
    },
    scale: 0.3
  },
  formDefaults: {
    width: 10,
    height: -20,
    directionStart: 180,
    directionEnd: 270,
    nodes: 1
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
