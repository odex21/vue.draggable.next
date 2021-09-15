import routes from "virtual:generated-pages";

// const showDebug = process.env.VUE_APP_SHOW_ALL_EXAMPLES === 'true'
// window.console.log(showDebug, process.env.VUE_APP_FILTER_ROUTE)

// function getRouteFilterFromConfiguration(configuration) {
//   const routeFromConfiguration = configuration
//     .split(',')
//     .filter((value) => value !== '')
//   if (routeFromConfiguration.length === 0) {
//     return () => true
//   }

//   window.console.log(
//     `Using route filter VUE_APP_FILTER_ROUTE: "${configuration}"`
//   )
//   return (name) => routeFromConfiguration.includes(name)
// }

// const filterRoute = getRouteFilterFromConfiguration(
//   process.env.VUE_APP_FILTER_ROUTE
// )

// routes.forEach(
//   (route) => (route.component.show = filterRoute(route.component.display))
// )

const filteredRoutes = routes; //.filter(r => r.name === "simple"); //.filter((route) => route.component.show)

// if (filteredRoutes.length === 0) {
//   throw new Error(
//     `No routes to match "${
//       process.env.VUE_APP_FILTER_ROUTE
//     }". Available route: ${routes
//       .map((route) => `"${route.component.display}"`)
//       .join(', ')} .Please check env variable: VUE_APP_FILTER_ROUTE`
//   )
// }

// const redirect = filteredRoutes.some((r) => r.path === '/simple')
//   ? '/simple'
//   : filteredRoutes[0].path

console.log("r", JSON.stringify(filteredRoutes));

const allRoutes = [...filteredRoutes, { path: "/", redirect: "/simple" }];

export default allRoutes;
