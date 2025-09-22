"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "middleware";
exports.ids = ["middleware"];
exports.modules = {

/***/ "(middleware)/../../node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ nHandler)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/../../node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/../../node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _middleware_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./middleware.ts */ \"(middleware)/./middleware.ts\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/../../node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__);\n\n\n// Import the userland code.\n\n\n\nconst mod = {\n    ..._middleware_ts__WEBPACK_IMPORTED_MODULE_2__\n};\nconst handler = mod.middleware || mod.default;\nconst page = \"/middleware\";\nif (typeof handler !== 'function') {\n    throw Object.defineProperty(new Error(`The Middleware \"${page}\" must export a \\`middleware\\` or a \\`default\\` function`), \"__NEXT_ERROR_CODE\", {\n        value: \"E120\",\n        enumerable: false,\n        configurable: true\n    });\n}\n// Middleware will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside middleware module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in middleware as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in Middleware.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/middleware',\n                routeType: 'middleware',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nfunction nHandler(opts) {\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__.adapter)({\n        ...opts,\n        page,\n        handler: errorHandledHandler(handler)\n    });\n}\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4uLy4uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtbWlkZGxld2FyZS1sb2FkZXIuanM/YWJzb2x1dGVQYWdlUGF0aD0lMkZVc2VycyUyRnN1bGV5bWFub3pkYXMlMkZldmVudC1tYXAlMkZhcHBzJTJGd2ViJTJGbWlkZGxld2FyZS50cyZwYWdlPSUyRm1pZGRsZXdhcmUmcm9vdERpcj0lMkZVc2VycyUyRnN1bGV5bWFub3pkYXMlMkZldmVudC1tYXAlMkZhcHBzJTJGd2ViJm1hdGNoZXJzPSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFzQztBQUNpQjtBQUN2RDtBQUN3QztBQUN5QztBQUNJO0FBQ3JGO0FBQ0EsT0FBTywyQ0FBSTtBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELEtBQUs7QUFDbEU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxnQkFBZ0IsSUFBcUM7QUFDckQsb0JBQW9CLG1HQUFpQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwrRkFBaUM7QUFDbkQ7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ2U7QUFDZixXQUFXLHFFQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQSIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL2dsb2JhbHNcIjtcbmltcG9ydCB7IGFkYXB0ZXIgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvYWRhcHRlclwiO1xuLy8gSW1wb3J0IHRoZSB1c2VybGFuZCBjb2RlLlxuaW1wb3J0ICogYXMgX21vZCBmcm9tIFwiLi9taWRkbGV3YXJlLnRzXCI7XG5pbXBvcnQgeyBlZGdlSW5zdHJ1bWVudGF0aW9uT25SZXF1ZXN0RXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgaXNOZXh0Um91dGVyRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2lzLW5leHQtcm91dGVyLWVycm9yXCI7XG5jb25zdCBtb2QgPSB7XG4gICAgLi4uX21vZFxufTtcbmNvbnN0IGhhbmRsZXIgPSBtb2QubWlkZGxld2FyZSB8fCBtb2QuZGVmYXVsdDtcbmNvbnN0IHBhZ2UgPSBcIi9taWRkbGV3YXJlXCI7XG5pZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3IEVycm9yKGBUaGUgTWlkZGxld2FyZSBcIiR7cGFnZX1cIiBtdXN0IGV4cG9ydCBhIFxcYG1pZGRsZXdhcmVcXGAgb3IgYSBcXGBkZWZhdWx0XFxgIGZ1bmN0aW9uYCksIFwiX19ORVhUX0VSUk9SX0NPREVcIiwge1xuICAgICAgICB2YWx1ZTogXCJFMTIwXCIsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbn1cbi8vIE1pZGRsZXdhcmUgd2lsbCBvbmx5IHNlbnQgb3V0IHRoZSBGZXRjaEV2ZW50IHRvIG5leHQgc2VydmVyLFxuLy8gc28gbG9hZCBpbnN0cnVtZW50YXRpb24gbW9kdWxlIGhlcmUgYW5kIHRyYWNrIHRoZSBlcnJvciBpbnNpZGUgbWlkZGxld2FyZSBtb2R1bGUuXG5mdW5jdGlvbiBlcnJvckhhbmRsZWRIYW5kbGVyKGZuKSB7XG4gICAgcmV0dXJuIGFzeW5jICguLi5hcmdzKT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIEluIGRldmVsb3BtZW50LCBlcnJvciB0aGUgbmF2aWdhdGlvbiBBUEkgdXNhZ2UgaW4gcnVudGltZSxcbiAgICAgICAgICAgIC8vIHNpbmNlIGl0J3Mgbm90IGFsbG93ZWQgdG8gYmUgdXNlZCBpbiBtaWRkbGV3YXJlIGFzIGl0J3Mgb3V0c2lkZSBvZiByZWFjdCBjb21wb25lbnQgdHJlZS5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV4dFJvdXRlckVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgTmV4dC5qcyBuYXZpZ2F0aW9uIEFQSSBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIE1pZGRsZXdhcmUuYDtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlcSA9IGFyZ3NbMF07XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2UgPSB1cmwucGF0aG5hbWUgKyB1cmwuc2VhcmNoO1xuICAgICAgICAgICAgYXdhaXQgZWRnZUluc3RydW1lbnRhdGlvbk9uUmVxdWVzdEVycm9yKGVyciwge1xuICAgICAgICAgICAgICAgIHBhdGg6IHJlc291cmNlLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBPYmplY3QuZnJvbUVudHJpZXMocmVxLmhlYWRlcnMuZW50cmllcygpKVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHJvdXRlcktpbmQ6ICdQYWdlcyBSb3V0ZXInLFxuICAgICAgICAgICAgICAgIHJvdXRlUGF0aDogJy9taWRkbGV3YXJlJyxcbiAgICAgICAgICAgICAgICByb3V0ZVR5cGU6ICdtaWRkbGV3YXJlJyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5IYW5kbGVyKG9wdHMpIHtcbiAgICByZXR1cm4gYWRhcHRlcih7XG4gICAgICAgIC4uLm9wdHMsXG4gICAgICAgIHBhZ2UsXG4gICAgICAgIGhhbmRsZXI6IGVycm9ySGFuZGxlZEhhbmRsZXIoaGFuZGxlcilcbiAgICB9KTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWlkZGxld2FyZS5qcy5tYXBcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(middleware)/../../node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./lib/supabase/middleware.ts":
/*!************************************!*\
  !*** ./lib/supabase/middleware.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   updateSession: () => (/* binding */ updateSession)\n/* harmony export */ });\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/ssr */ \"(middleware)/../../node_modules/@supabase/ssr/dist/module/index.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(middleware)/../../node_modules/next/dist/api/server.js\");\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ \"(middleware)/./lib/utils.ts\");\n\n\n\nasync function updateSession(request) {\n    let supabaseResponse = next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.next({\n        request\n    });\n    // If the env vars are not set, skip middleware check. You can remove this\n    // once you setup the project.\n    if (!_utils__WEBPACK_IMPORTED_MODULE_2__.hasEnvVars) {\n        return supabaseResponse;\n    }\n    // With Fluid compute, don't put this client in a global environment\n    // variable. Always create a new one on each request.\n    const supabase = (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_0__.createServerClient)(\"https://wpydilkmtmgbunectxpx.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweWRpbGttdG1nYnVuZWN0eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Njc0MjUsImV4cCI6MjA2MzI0MzQyNX0.OXl2AHppGSFWSGypG_2_NZj7atD_gM_U2I7oAkpTB5w\", {\n        cookies: {\n            getAll () {\n                return request.cookies.getAll();\n            },\n            setAll (cookiesToSet) {\n                cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));\n                supabaseResponse = next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.next({\n                    request\n                });\n                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));\n            }\n        }\n    });\n    // Do not run code between createServerClient and\n    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug\n    // issues with users being randomly logged out.\n    // IMPORTANT: If you remove getClaims() and you use server-side rendering\n    // with the Supabase client, your users may be randomly logged out.\n    const { data } = await supabase.auth.getClaims();\n    const user = data?.claims;\n    // Check for admin routes first\n    if (request.nextUrl.pathname.startsWith(\"/admin\")) {\n        if (!user) {\n            const url = request.nextUrl.clone();\n            url.pathname = \"/auth/login\";\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(url);\n        }\n        // Check if user is admin\n        const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.sub).single();\n        if (profile?.role !== 'admin') {\n            // Redirect non-admin users away from admin routes\n            const url = request.nextUrl.clone();\n            url.pathname = \"/\";\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(url);\n        }\n    }\n    // Regular authentication checks\n    if (request.nextUrl.pathname !== \"/\" && !user && !request.nextUrl.pathname.startsWith(\"/login\") && !request.nextUrl.pathname.startsWith(\"/auth\") && !request.nextUrl.pathname.startsWith(\"/api\") && !request.nextUrl.pathname.startsWith(\"/app\")) {\n        // no user, potentially respond by redirecting the user to the login page\n        const url = request.nextUrl.clone();\n        url.pathname = \"/auth/login\";\n        return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(url);\n    }\n    // Check for protected routes (legacy - redirect to login)\n    if (request.nextUrl.pathname.startsWith(\"/protected\")) {\n        if (!user) {\n            const url = request.nextUrl.clone();\n            url.pathname = \"/auth/login\";\n            return next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse.redirect(url);\n        }\n    }\n    // IMPORTANT: You *must* return the supabaseResponse object as it is.\n    // If you're creating a new response object with NextResponse.next() make sure to:\n    // 1. Pass the request in it, like so:\n    //    const myNewResponse = NextResponse.next({ request })\n    // 2. Copy over the cookies, like so:\n    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())\n    // 3. Change the myNewResponse object to fit your needs, but avoid changing\n    //    the cookies!\n    // 4. Finally:\n    //    return myNewResponse\n    // If this is not done, you may be causing the browser and server to go out\n    // of sync and terminate the user's session prematurely!\n    return supabaseResponse;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbGliL3N1cGFiYXNlL21pZGRsZXdhcmUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFtRDtBQUNVO0FBQ3ZCO0FBRS9CLGVBQWVHLGNBQWNDLE9BQW9CO0lBQ3RELElBQUlDLG1CQUFtQkoscURBQVlBLENBQUNLLElBQUksQ0FBQztRQUN2Q0Y7SUFDRjtJQUVBLDBFQUEwRTtJQUMxRSw4QkFBOEI7SUFDOUIsSUFBSSxDQUFDRiw4Q0FBVUEsRUFBRTtRQUNmLE9BQU9HO0lBQ1Q7SUFFQSxvRUFBb0U7SUFDcEUscURBQXFEO0lBQ3JELE1BQU1FLFdBQVdQLGlFQUFrQkEsQ0FDakNRLDBDQUFvQyxFQUNwQ0Esa05BQXdELEVBQ3hEO1FBQ0VJLFNBQVM7WUFDUEM7Z0JBQ0UsT0FBT1QsUUFBUVEsT0FBTyxDQUFDQyxNQUFNO1lBQy9CO1lBQ0FDLFFBQU9DLFlBQVk7Z0JBQ2pCQSxhQUFhQyxPQUFPLENBQUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRSxHQUNuQ2QsUUFBUVEsT0FBTyxDQUFDTyxHQUFHLENBQUNGLE1BQU1DO2dCQUU1QmIsbUJBQW1CSixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO29CQUNuQ0Y7Z0JBQ0Y7Z0JBQ0FXLGFBQWFDLE9BQU8sQ0FBQyxDQUFDLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFRSxPQUFPLEVBQUUsR0FDNUNmLGlCQUFpQk8sT0FBTyxDQUFDTyxHQUFHLENBQUNGLE1BQU1DLE9BQU9FO1lBRTlDO1FBQ0Y7SUFDRjtJQUdGLGlEQUFpRDtJQUNqRCwrRUFBK0U7SUFDL0UsK0NBQStDO0lBRS9DLHlFQUF5RTtJQUN6RSxtRUFBbUU7SUFDbkUsTUFBTSxFQUFFQyxJQUFJLEVBQUUsR0FBRyxNQUFNZCxTQUFTZSxJQUFJLENBQUNDLFNBQVM7SUFDOUMsTUFBTUMsT0FBT0gsTUFBTUk7SUFFbkIsK0JBQStCO0lBQy9CLElBQUlyQixRQUFRc0IsT0FBTyxDQUFDQyxRQUFRLENBQUNDLFVBQVUsQ0FBQyxXQUFXO1FBQ2pELElBQUksQ0FBQ0osTUFBTTtZQUNULE1BQU1LLE1BQU16QixRQUFRc0IsT0FBTyxDQUFDSSxLQUFLO1lBQ2pDRCxJQUFJRixRQUFRLEdBQUc7WUFDZixPQUFPMUIscURBQVlBLENBQUM4QixRQUFRLENBQUNGO1FBQy9CO1FBRUEseUJBQXlCO1FBQ3pCLE1BQU0sRUFBRVIsTUFBTVcsT0FBTyxFQUFFLEdBQUcsTUFBTXpCLFNBQzdCMEIsSUFBSSxDQUFDLGlCQUNMQyxNQUFNLENBQUMsUUFDUEMsRUFBRSxDQUFDLE1BQU1YLEtBQUtZLEdBQUcsRUFDakJDLE1BQU07UUFFVCxJQUFJTCxTQUFTTSxTQUFTLFNBQVM7WUFDN0Isa0RBQWtEO1lBQ2xELE1BQU1ULE1BQU16QixRQUFRc0IsT0FBTyxDQUFDSSxLQUFLO1lBQ2pDRCxJQUFJRixRQUFRLEdBQUc7WUFDZixPQUFPMUIscURBQVlBLENBQUM4QixRQUFRLENBQUNGO1FBQy9CO0lBQ0Y7SUFFQSxnQ0FBZ0M7SUFDaEMsSUFDRXpCLFFBQVFzQixPQUFPLENBQUNDLFFBQVEsS0FBSyxPQUM3QixDQUFDSCxRQUNELENBQUNwQixRQUFRc0IsT0FBTyxDQUFDQyxRQUFRLENBQUNDLFVBQVUsQ0FBQyxhQUNyQyxDQUFDeEIsUUFBUXNCLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDQyxVQUFVLENBQUMsWUFDckMsQ0FBQ3hCLFFBQVFzQixPQUFPLENBQUNDLFFBQVEsQ0FBQ0MsVUFBVSxDQUFDLFdBQ3JDLENBQUN4QixRQUFRc0IsT0FBTyxDQUFDQyxRQUFRLENBQUNDLFVBQVUsQ0FBQyxTQUNyQztRQUNBLHlFQUF5RTtRQUN6RSxNQUFNQyxNQUFNekIsUUFBUXNCLE9BQU8sQ0FBQ0ksS0FBSztRQUNqQ0QsSUFBSUYsUUFBUSxHQUFHO1FBQ2YsT0FBTzFCLHFEQUFZQSxDQUFDOEIsUUFBUSxDQUFDRjtJQUMvQjtJQUVBLDBEQUEwRDtJQUMxRCxJQUFJekIsUUFBUXNCLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDQyxVQUFVLENBQUMsZUFBZTtRQUNyRCxJQUFJLENBQUNKLE1BQU07WUFDVCxNQUFNSyxNQUFNekIsUUFBUXNCLE9BQU8sQ0FBQ0ksS0FBSztZQUNqQ0QsSUFBSUYsUUFBUSxHQUFHO1lBQ2YsT0FBTzFCLHFEQUFZQSxDQUFDOEIsUUFBUSxDQUFDRjtRQUMvQjtJQUNGO0lBRUEscUVBQXFFO0lBQ3JFLGtGQUFrRjtJQUNsRixzQ0FBc0M7SUFDdEMsMERBQTBEO0lBQzFELHFDQUFxQztJQUNyQyxxRUFBcUU7SUFDckUsMkVBQTJFO0lBQzNFLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsMEJBQTBCO0lBQzFCLDJFQUEyRTtJQUMzRSx3REFBd0Q7SUFFeEQsT0FBT3hCO0FBQ1QiLCJzb3VyY2VzIjpbIi9Vc2Vycy9zdWxleW1hbm96ZGFzL2V2ZW50LW1hcC9hcHBzL3dlYi9saWIvc3VwYWJhc2UvbWlkZGxld2FyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3NzclwiO1xuaW1wb3J0IHsgTmV4dFJlc3BvbnNlLCB0eXBlIE5leHRSZXF1ZXN0IH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBoYXNFbnZWYXJzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXNzaW9uKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIGxldCBzdXBhYmFzZVJlc3BvbnNlID0gTmV4dFJlc3BvbnNlLm5leHQoe1xuICAgIHJlcXVlc3QsXG4gIH0pO1xuXG4gIC8vIElmIHRoZSBlbnYgdmFycyBhcmUgbm90IHNldCwgc2tpcCBtaWRkbGV3YXJlIGNoZWNrLiBZb3UgY2FuIHJlbW92ZSB0aGlzXG4gIC8vIG9uY2UgeW91IHNldHVwIHRoZSBwcm9qZWN0LlxuICBpZiAoIWhhc0VudlZhcnMpIHtcbiAgICByZXR1cm4gc3VwYWJhc2VSZXNwb25zZTtcbiAgfVxuXG4gIC8vIFdpdGggRmx1aWQgY29tcHV0ZSwgZG9uJ3QgcHV0IHRoaXMgY2xpZW50IGluIGEgZ2xvYmFsIGVudmlyb25tZW50XG4gIC8vIHZhcmlhYmxlLiBBbHdheXMgY3JlYXRlIGEgbmV3IG9uZSBvbiBlYWNoIHJlcXVlc3QuXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlU2VydmVyQ2xpZW50KFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfUFVCTElTSEFCTEVfT1JfQU5PTl9LRVkhLFxuICAgIHtcbiAgICAgIGNvb2tpZXM6IHtcbiAgICAgICAgZ2V0QWxsKCkge1xuICAgICAgICAgIHJldHVybiByZXF1ZXN0LmNvb2tpZXMuZ2V0QWxsKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEFsbChjb29raWVzVG9TZXQpIHtcbiAgICAgICAgICBjb29raWVzVG9TZXQuZm9yRWFjaCgoeyBuYW1lLCB2YWx1ZSB9KSA9PlxuICAgICAgICAgICAgcmVxdWVzdC5jb29raWVzLnNldChuYW1lLCB2YWx1ZSksXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzdXBhYmFzZVJlc3BvbnNlID0gTmV4dFJlc3BvbnNlLm5leHQoe1xuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb29raWVzVG9TZXQuZm9yRWFjaCgoeyBuYW1lLCB2YWx1ZSwgb3B0aW9ucyB9KSA9PlxuICAgICAgICAgICAgc3VwYWJhc2VSZXNwb25zZS5jb29raWVzLnNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucyksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgKTtcblxuICAvLyBEbyBub3QgcnVuIGNvZGUgYmV0d2VlbiBjcmVhdGVTZXJ2ZXJDbGllbnQgYW5kXG4gIC8vIHN1cGFiYXNlLmF1dGguZ2V0Q2xhaW1zKCkuIEEgc2ltcGxlIG1pc3Rha2UgY291bGQgbWFrZSBpdCB2ZXJ5IGhhcmQgdG8gZGVidWdcbiAgLy8gaXNzdWVzIHdpdGggdXNlcnMgYmVpbmcgcmFuZG9tbHkgbG9nZ2VkIG91dC5cblxuICAvLyBJTVBPUlRBTlQ6IElmIHlvdSByZW1vdmUgZ2V0Q2xhaW1zKCkgYW5kIHlvdSB1c2Ugc2VydmVyLXNpZGUgcmVuZGVyaW5nXG4gIC8vIHdpdGggdGhlIFN1cGFiYXNlIGNsaWVudCwgeW91ciB1c2VycyBtYXkgYmUgcmFuZG9tbHkgbG9nZ2VkIG91dC5cbiAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldENsYWltcygpO1xuICBjb25zdCB1c2VyID0gZGF0YT8uY2xhaW1zO1xuXG4gIC8vIENoZWNrIGZvciBhZG1pbiByb3V0ZXMgZmlyc3RcbiAgaWYgKHJlcXVlc3QubmV4dFVybC5wYXRobmFtZS5zdGFydHNXaXRoKFwiL2FkbWluXCIpKSB7XG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICBjb25zdCB1cmwgPSByZXF1ZXN0Lm5leHRVcmwuY2xvbmUoKTtcbiAgICAgIHVybC5wYXRobmFtZSA9IFwiL2F1dGgvbG9naW5cIjtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UucmVkaXJlY3QodXJsKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB1c2VyIGlzIGFkbWluXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3VzZXJfcHJvZmlsZXMnKVxuICAgICAgLnNlbGVjdCgncm9sZScpXG4gICAgICAuZXEoJ2lkJywgdXNlci5zdWIpXG4gICAgICAuc2luZ2xlKCk7XG5cbiAgICBpZiAocHJvZmlsZT8ucm9sZSAhPT0gJ2FkbWluJykge1xuICAgICAgLy8gUmVkaXJlY3Qgbm9uLWFkbWluIHVzZXJzIGF3YXkgZnJvbSBhZG1pbiByb3V0ZXNcbiAgICAgIGNvbnN0IHVybCA9IHJlcXVlc3QubmV4dFVybC5jbG9uZSgpO1xuICAgICAgdXJsLnBhdGhuYW1lID0gXCIvXCI7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KHVybCk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVndWxhciBhdXRoZW50aWNhdGlvbiBjaGVja3NcbiAgaWYgKFxuICAgIHJlcXVlc3QubmV4dFVybC5wYXRobmFtZSAhPT0gXCIvXCIgJiZcbiAgICAhdXNlciAmJlxuICAgICFyZXF1ZXN0Lm5leHRVcmwucGF0aG5hbWUuc3RhcnRzV2l0aChcIi9sb2dpblwiKSAmJlxuICAgICFyZXF1ZXN0Lm5leHRVcmwucGF0aG5hbWUuc3RhcnRzV2l0aChcIi9hdXRoXCIpICYmXG4gICAgIXJlcXVlc3QubmV4dFVybC5wYXRobmFtZS5zdGFydHNXaXRoKFwiL2FwaVwiKSAmJlxuICAgICFyZXF1ZXN0Lm5leHRVcmwucGF0aG5hbWUuc3RhcnRzV2l0aChcIi9hcHBcIilcbiAgKSB7XG4gICAgLy8gbm8gdXNlciwgcG90ZW50aWFsbHkgcmVzcG9uZCBieSByZWRpcmVjdGluZyB0aGUgdXNlciB0byB0aGUgbG9naW4gcGFnZVxuICAgIGNvbnN0IHVybCA9IHJlcXVlc3QubmV4dFVybC5jbG9uZSgpO1xuICAgIHVybC5wYXRobmFtZSA9IFwiL2F1dGgvbG9naW5cIjtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KHVybCk7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgcHJvdGVjdGVkIHJvdXRlcyAobGVnYWN5IC0gcmVkaXJlY3QgdG8gbG9naW4pXG4gIGlmIChyZXF1ZXN0Lm5leHRVcmwucGF0aG5hbWUuc3RhcnRzV2l0aChcIi9wcm90ZWN0ZWRcIikpIHtcbiAgICBpZiAoIXVzZXIpIHtcbiAgICAgIGNvbnN0IHVybCA9IHJlcXVlc3QubmV4dFVybC5jbG9uZSgpO1xuICAgICAgdXJsLnBhdGhuYW1lID0gXCIvYXV0aC9sb2dpblwiO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5yZWRpcmVjdCh1cmwpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElNUE9SVEFOVDogWW91ICptdXN0KiByZXR1cm4gdGhlIHN1cGFiYXNlUmVzcG9uc2Ugb2JqZWN0IGFzIGl0IGlzLlxuICAvLyBJZiB5b3UncmUgY3JlYXRpbmcgYSBuZXcgcmVzcG9uc2Ugb2JqZWN0IHdpdGggTmV4dFJlc3BvbnNlLm5leHQoKSBtYWtlIHN1cmUgdG86XG4gIC8vIDEuIFBhc3MgdGhlIHJlcXVlc3QgaW4gaXQsIGxpa2Ugc286XG4gIC8vICAgIGNvbnN0IG15TmV3UmVzcG9uc2UgPSBOZXh0UmVzcG9uc2UubmV4dCh7IHJlcXVlc3QgfSlcbiAgLy8gMi4gQ29weSBvdmVyIHRoZSBjb29raWVzLCBsaWtlIHNvOlxuICAvLyAgICBteU5ld1Jlc3BvbnNlLmNvb2tpZXMuc2V0QWxsKHN1cGFiYXNlUmVzcG9uc2UuY29va2llcy5nZXRBbGwoKSlcbiAgLy8gMy4gQ2hhbmdlIHRoZSBteU5ld1Jlc3BvbnNlIG9iamVjdCB0byBmaXQgeW91ciBuZWVkcywgYnV0IGF2b2lkIGNoYW5naW5nXG4gIC8vICAgIHRoZSBjb29raWVzIVxuICAvLyA0LiBGaW5hbGx5OlxuICAvLyAgICByZXR1cm4gbXlOZXdSZXNwb25zZVxuICAvLyBJZiB0aGlzIGlzIG5vdCBkb25lLCB5b3UgbWF5IGJlIGNhdXNpbmcgdGhlIGJyb3dzZXIgYW5kIHNlcnZlciB0byBnbyBvdXRcbiAgLy8gb2Ygc3luYyBhbmQgdGVybWluYXRlIHRoZSB1c2VyJ3Mgc2Vzc2lvbiBwcmVtYXR1cmVseSFcblxuICByZXR1cm4gc3VwYWJhc2VSZXNwb25zZTtcbn1cbiJdLCJuYW1lcyI6WyJjcmVhdGVTZXJ2ZXJDbGllbnQiLCJOZXh0UmVzcG9uc2UiLCJoYXNFbnZWYXJzIiwidXBkYXRlU2Vzc2lvbiIsInJlcXVlc3QiLCJzdXBhYmFzZVJlc3BvbnNlIiwibmV4dCIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1BVQkxJU0hBQkxFX09SX0FOT05fS0VZIiwiY29va2llcyIsImdldEFsbCIsInNldEFsbCIsImNvb2tpZXNUb1NldCIsImZvckVhY2giLCJuYW1lIiwidmFsdWUiLCJzZXQiLCJvcHRpb25zIiwiZGF0YSIsImF1dGgiLCJnZXRDbGFpbXMiLCJ1c2VyIiwiY2xhaW1zIiwibmV4dFVybCIsInBhdGhuYW1lIiwic3RhcnRzV2l0aCIsInVybCIsImNsb25lIiwicmVkaXJlY3QiLCJwcm9maWxlIiwiZnJvbSIsInNlbGVjdCIsImVxIiwic3ViIiwic2luZ2xlIiwicm9sZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./lib/supabase/middleware.ts\n");

/***/ }),

/***/ "(middleware)/./lib/utils.ts":
/*!**********************!*\
  !*** ./lib/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   cn: () => (/* binding */ cn),\n/* harmony export */   hasEnvVars: () => (/* binding */ hasEnvVars)\n/* harmony export */ });\n/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! clsx */ \"(middleware)/../../node_modules/clsx/dist/clsx.mjs\");\n/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tailwind-merge */ \"(middleware)/../../node_modules/tailwind-merge/dist/bundle-mjs.mjs\");\n\n\nfunction cn(...inputs) {\n    return (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)((0,clsx__WEBPACK_IMPORTED_MODULE_0__.clsx)(inputs));\n}\n// This check can be removed, it is just for tutorial purposes\nconst hasEnvVars =  true && \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweWRpbGttdG1nYnVuZWN0eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Njc0MjUsImV4cCI6MjA2MzI0MzQyNX0.OXl2AHppGSFWSGypG_2_NZj7atD_gM_U2I7oAkpTB5w\";\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbGliL3V0aWxzLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBNkM7QUFDSjtBQUVsQyxTQUFTRSxHQUFHLEdBQUdDLE1BQW9CO0lBQ3hDLE9BQU9GLHVEQUFPQSxDQUFDRCwwQ0FBSUEsQ0FBQ0c7QUFDdEI7QUFFQSw4REFBOEQ7QUFDdkQsTUFBTUMsYUFDWEMsS0FBb0MsSUFDcENBLGtOQUF3RCxDQUFDIiwic291cmNlcyI6WyIvVXNlcnMvc3VsZXltYW5vemRhcy9ldmVudC1tYXAvYXBwcy93ZWIvbGliL3V0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNsc3gsIHR5cGUgQ2xhc3NWYWx1ZSB9IGZyb20gXCJjbHN4XCI7XG5pbXBvcnQgeyB0d01lcmdlIH0gZnJvbSBcInRhaWx3aW5kLW1lcmdlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbiguLi5pbnB1dHM6IENsYXNzVmFsdWVbXSkge1xuICByZXR1cm4gdHdNZXJnZShjbHN4KGlucHV0cykpO1xufVxuXG4vLyBUaGlzIGNoZWNrIGNhbiBiZSByZW1vdmVkLCBpdCBpcyBqdXN0IGZvciB0dXRvcmlhbCBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IGhhc0VudlZhcnMgPVxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwgJiZcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfUFVCTElTSEFCTEVfT1JfQU5PTl9LRVk7XG4iXSwibmFtZXMiOlsiY2xzeCIsInR3TWVyZ2UiLCJjbiIsImlucHV0cyIsImhhc0VudlZhcnMiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfUFVCTElTSEFCTEVfT1JfQU5PTl9LRVkiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./lib/utils.ts\n");

/***/ }),

/***/ "(middleware)/./middleware.ts":
/*!***********************!*\
  !*** ./middleware.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   middleware: () => (/* binding */ middleware)\n/* harmony export */ });\n/* harmony import */ var _lib_supabase_middleware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/supabase/middleware */ \"(middleware)/./lib/supabase/middleware.ts\");\n\nasync function middleware(request) {\n    return await (0,_lib_supabase_middleware__WEBPACK_IMPORTED_MODULE_0__.updateSession)(request);\n}\nconst config = {\n    matcher: [\n        /*\n     * Match all request paths except:\n     * - _next/static (static files)\n     * - _next/image (image optimization files)\n     * - favicon.ico (favicon file)\n     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp\n     * Feel free to modify this pattern to include more paths.\n     */ \"/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)\"\n    ],\n    runtime: 'nodejs'\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbWlkZGxld2FyZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEQ7QUFHbkQsZUFBZUMsV0FBV0MsT0FBb0I7SUFDbkQsT0FBTyxNQUFNRix1RUFBYUEsQ0FBQ0U7QUFDN0I7QUFFTyxNQUFNQyxTQUFTO0lBQ3BCQyxTQUFTO1FBQ1A7Ozs7Ozs7S0FPQyxHQUNEO0tBQ0Q7SUFDREMsU0FBUztBQUNYLEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9zdWxleW1hbm96ZGFzL2V2ZW50LW1hcC9hcHBzL3dlYi9taWRkbGV3YXJlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVwZGF0ZVNlc3Npb24gfSBmcm9tIFwiQC9saWIvc3VwYWJhc2UvbWlkZGxld2FyZVwiO1xuaW1wb3J0IHsgdHlwZSBOZXh0UmVxdWVzdCB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWlkZGxld2FyZShyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICByZXR1cm4gYXdhaXQgdXBkYXRlU2Vzc2lvbihyZXF1ZXN0KTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgbWF0Y2hlcjogW1xuICAgIC8qXG4gICAgICogTWF0Y2ggYWxsIHJlcXVlc3QgcGF0aHMgZXhjZXB0OlxuICAgICAqIC0gX25leHQvc3RhdGljIChzdGF0aWMgZmlsZXMpXG4gICAgICogLSBfbmV4dC9pbWFnZSAoaW1hZ2Ugb3B0aW1pemF0aW9uIGZpbGVzKVxuICAgICAqIC0gZmF2aWNvbi5pY28gKGZhdmljb24gZmlsZSlcbiAgICAgKiAtIGltYWdlcyAtIC5zdmcsIC5wbmcsIC5qcGcsIC5qcGVnLCAuZ2lmLCAud2VicFxuICAgICAqIEZlZWwgZnJlZSB0byBtb2RpZnkgdGhpcyBwYXR0ZXJuIHRvIGluY2x1ZGUgbW9yZSBwYXRocy5cbiAgICAgKi9cbiAgICBcIi8oKD8hX25leHQvc3RhdGljfF9uZXh0L2ltYWdlfGZhdmljb24uaWNvfC4qXFxcXC4oPzpzdmd8cG5nfGpwZ3xqcGVnfGdpZnx3ZWJwKSQpLiopXCIsXG4gIF0sXG4gIHJ1bnRpbWU6ICdub2RlanMnLFxufTtcbiJdLCJuYW1lcyI6WyJ1cGRhdGVTZXNzaW9uIiwibWlkZGxld2FyZSIsInJlcXVlc3QiLCJjb25maWciLCJtYXRjaGVyIiwicnVudGltZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./middleware.ts\n");

/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "../lib/cache-handlers/default.external":
/*!**************************************************************************!*\
  !*** external "next/dist/server/lib/cache-handlers/default.external.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/cache-handlers/default.external.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/tailwind-merge","vendor-chunks/whatwg-url","vendor-chunks/cookie","vendor-chunks/webidl-conversions","vendor-chunks/clsx"], () => (__webpack_exec__("(middleware)/../../node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb%2Fmiddleware.ts&page=%2Fmiddleware&rootDir=%2FUsers%2Fsuleymanozdas%2Fevent-map%2Fapps%2Fweb&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();