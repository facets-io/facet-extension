import $ from 'jquery';
import { getKeyFromLocalStorage } from './shared/loadLocalStorage';
import { getFacet, getOrPostDomain } from './services/facetApiService';
import parsePath from './shared/parsePath';
import { api, styles } from './shared/constant';
import get from 'lodash/get';
import { getElementNameFromPath } from './shared/parsePath';
import isDevelopment from './utils/isDevelopment';

/**
 * Performs transformation on client's DOM
 */
const performDOMTransformation = () => {
    console.log('[facet.ninja][loader]');

    // push the body
    $('body').attr('style', function (i, s) {
        return (s || '') + `position: absolute !important;left: ${styles.drawerWidth}px !important;right: 0px !important;min-height: calc(100% - 96px) !important;overflow-x: initial !important;`;
    });

    if (isDevelopment()) {
        return
    }

    $('*') && $('*').filter(function () {
        return $(this).css('position') === 'fixed' && this.id !== 'facetizer' &&
            this.className !== 'MuiPaper-root MuiDrawer-paper jss4 MuiDrawer-paperAnchorLeft MuiDrawer-paperAnchorDockedLeft MuiPaper-elevation0';
    }).each(function () {
        $(this).css('position', 'absolute', 'important');
        $(this).css('left', `${styles.drawerWidth}px`, 'important');
    })
}

// facetMap & setFacetMap
// singletons
let domainId;
let workspaceId;
let getFacetResponse;
let enqueueSnackbar;

const onMouseEnterHandle = function (event) {
    event.target.style.setProperty("outline", "5px ridge #c25d29");
    event.target.style.setProperty("cursor", "pointer");
};

/**
 * @param {selectedFacet} selected facet
 * @param {setFacetMap} lifecycle event
 */
const onMouseLeaveHandle = function (event) {
    event.target.style.setProperty("outline", "unset");
    event.target.style.setProperty("cursor", "unset");
}

const convertToDomElementObject = (path) => {
    return {
        name: getElementNameFromPath(path),
        path: path
    }
}

const extractAllDomElementPathsFromFacetMap = (facetMap) => {
    let facetArray = Array.from(facetMap, ([name, value]) => ({ name, value }));
    if (facetArray.length === 0) {
        return []
    }
    return facetArray.map(facet => facet.value.map(domElement => domElement.path)).flat();
}

const removeDomPath = (facetMap, domPath, setFacetMap, selectedFacet) => {
    facetMap && facetMap.forEach((facet, key) => {
        var newFacetArr = facet.filter(e => e.path !== domPath);
        if (facet.length !== newFacetArr.length) {
            if (key !== selectedFacet) {
                enqueueSnackbar(`Element was removed from the "${key}" facet.`, { variant: "info" });
            }
            setFacetMap(new Map(facetMap.set(key, newFacetArr)));
            return;
        }
    });
}

/**
 * @param {*} facetMap 
 */
const loadInitialState = (facetMap) => {
    const facetArray = Array.from(facetMap, ([name, value]) => ({ name, value }));
    facetArray && facetArray.forEach(facet => {
        const value = facet.value;
        value && value.forEach(domElement => {
            const path = parsePath([domElement.path], true);
            $(path[0]).css("opacity", "0.3", "important");
            // TODO tmp hack find out why path not computing properly
            $(domElement.path).css("opacity", "0.3", "important");
        })
    })
}

/**
 * DOM Event Listener of Facet selection
 */
const onMouseClickHandle = function (event) {
    const selectedFacet = event.currentTarget.selectedFacet;
    const setFacetMap = event.currentTarget.setFacetMap;
    const facetMap = event.currentTarget.facetMap;
    const domPath = getDomPath(event.target);
    const allPaths = extractAllDomElementPathsFromFacetMap(facetMap);
    if (allPaths.includes(domPath)) {
        // remove element
        removeDomPath(facetMap, domPath, setFacetMap, selectedFacet);
        event.target.style.setProperty("opacity", "unset");
    } else {
        // add element
        let facet = facetMap.get(selectedFacet) || [];
        const domElementObj = convertToDomElementObject(domPath);
        facet.push(domElementObj)
        setFacetMap(new Map(facetMap.set(selectedFacet, facet)));
        event.target.style.setProperty("opacity", "0.3", "important");
    }
    event.preventDefault();
    event.stopPropagation();
}

function getDomPath(el) {
    var stack = [];
    while (el.parentNode != null) {
        var sibCount = 0;
        var sibIndex = 0;
        for (var i = 0; i < el.parentNode.childNodes.length; i++) {
            var sib = el.parentNode.childNodes[i];
            if (sib.nodeName == el.nodeName) {
                if (sib === el) {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        if (el.hasAttribute('id') && el.id != '') {
            stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
        } else if (sibCount > 1) {
            stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
        } else {
            stack.unshift(el.nodeName.toLowerCase());
        }
        el = el.parentNode;
    }
    var res = stack.slice(1).join(' > '); // removes the html element
    var withoutSpaces = res.replace(/ /g, "");
    return withoutSpaces;
}

// TODO refactor
// must refactor -> a lot of stuff in here...
// this function should only register/unregister callbacks, ideally it shouldn't handle any req
/**
 * 
 * @param {*} addEventsFlag Determines whether events will be added or removed from the DOM
 * @param {*} selectedFacet Currently selected facet
 * @param {*} facetMap Map of facets
 * @param {*} enqueueSnackbar notification context
 */
const updateEvents = async (addEventsFlag, selectedFacet, facetMap, setFacetMap, eSBar) => {
    try {
        // 1 time instantiation of singletons
        // kinda ugly, define a loader function her
        if (!workspaceId) {
            workspaceId = await getKeyFromLocalStorage(api.workspace.workspaceId);
            let getDomainRes = await getOrPostDomain(workspaceId);
            domainId = getDomainRes.response.id;
            getFacetResponse = await getFacet(domainId, window.location.pathname);
            const properFacetArr = parsePath(get(getFacetResponse, 'response.domElement[0].path'), false);
            properFacetArr && properFacetArr.forEach(ff => {
                $(ff).css("opacity", "0.3", "important");
            });
            enqueueSnackbar = eSBar;
        }

        [...document.querySelectorAll('* > :not(#facetizer) * > :not(#popup) * > :not(#facet-menu) *')]
            .filter(e => ![...document.querySelectorAll("#facetizer *, #popup *")]
                .includes(e)).forEach(e => {
                    // attaching these parameters into the event
                    e.selectedFacet = selectedFacet;
                    e.facetMap = facetMap;
                    e.setFacetMap = setFacetMap;
                    e.enqueueSnackbar = enqueueSnackbar;
                    if (addEventsFlag) {
                        e.addEventListener("click", onMouseClickHandle, false);
                        e.addEventListener("mouseenter", onMouseEnterHandle, false);
                        e.addEventListener("mouseleave", onMouseLeaveHandle, false);
                    } else {
                        e.removeEventListener("click", onMouseClickHandle, false);
                        e.removeEventListener("mouseenter", onMouseEnterHandle, false);
                        e.removeEventListener("mouseleave", onMouseLeaveHandle, false);
                        e.style.cursor = "cursor";
                    }
                });
    } catch (e) {
        console.log(`[ERROR] [updateEvents] `, e);
    }
}

export { updateEvents, onMouseEnterHandle, loadInitialState, performDOMTransformation };