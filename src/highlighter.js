import $ from 'jquery';
import { getKeyFromLocalStorage } from './shared/loadLocalStorage';
import { getFacet, getOrPostDomain } from './services/facetApiService';
import parsePath from './shared/parsePath';
import { api, snackbar, styles } from './shared/constant';
import isDevelopment from './utils/isDevelopment';

/**
 * Performs transformation on client's DOM
 */
const performDOMTransformation = () => {
    // push the body
    $('body').attr('style', function (i, s) {
        return (s || '') + `position: absolute !important;left: ${styles.drawerWidth}px !important;right: 0px !important;min-height: calc(100% - 96px) !important;overflow-x: initial !important;`;
    });

    if (isDevelopment()) {
        return
    }
    $('*') && $('*').filter(function () {
        return $(this).css('position') === 'fixed' && this.id !== 'facetizer' &&
            this.className !== 'MuiPaper-root MuiDrawer-paper jss8 MuiDrawer-paperAnchorLeft MuiDrawer-paperAnchorDockedLeft MuiPaper-elevation0';
    }).each(function () {
        $(this).css('position', 'absolute', 'important');
        $(this).css('left', `${styles.drawerWidth}px`, 'important');
    })
}

// getters  & setters from public context

let selectedFacet;
const setSelectedFacetHighlighter = (value) => {
    selectedFacet = value;
}
const getSelectedFacet = () => {
    return selectedFacet;
}

let facetMap;
let getFacetMap = (value) => {
    return facetMap;
}
let setFacetMapHighlighter = (value) => {
    facetMap = value;
}

let nonRolledOutFacetsHighlighter = [];
let setNonRolledOutFacetsHighlighter = (value) => {
    updatedDOMNonRolledOutFacets(nonRolledOutFacetsHighlighter, value);
    nonRolledOutFacetsHighlighter = value;
}

const updatedDOMNonRolledOutFacets = (prevVal, afterVal) => {
    // newly added values
    afterVal.filter(e => !prevVal.includes(e)).forEach(val => {
        const facetMap = getFacetMap();
        const pathArr = facetMap.get(val);
        pathArr?.forEach(element => {
            if (isSelectorValid(element.path)) {
                const domElement = document.querySelector(element.path);
                if (domElement) {
                    domElement.style.setProperty("opacity", "0.3", "important");
                }
            }
        });
    });

    // removed values
    prevVal.filter(e => !afterVal.includes(e)).forEach(val => {
        const facetMap = getFacetMap();
        const pathArr = facetMap.get(val);
        pathArr?.forEach(element => {
            if (isSelectorValid(element.path)) {
                const domElement = document.querySelector(element.path);
                if (domElement) {
                    domElement.style.setProperty('opacity', 'unset');
                }
            }
        });
    });
}

const queryCheck = s => document.createDocumentFragment().querySelector(s)

const isSelectorValid = selector => {
    try { queryCheck(selector) } catch { return false }
    return true
}

// facetMap & setFacetMap
// singletons
let domainId;
let workspaceId;
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

/**
 * 
 * Recursively iterates on existing domElements, and assigns the correct incremental suffix to the domElement
 * 
 * @param {*} elementType 
 * @param {*} facet 
 * @param {*} currNumber 
 */
const getIncreasedElementNameNumber = (elementType, facet, currNumber = 1) => {
    const nameArr = elementType.split('-');
    if (nameArr.length === 1) {
        const result = `${elementType}-${currNumber}`;
        if (facet.filter(e => e.name === result).length > 0) {
            return getIncreasedElementNameNumber(result, facet, currNumber + 1);
        } else {
            return result;
        }
    }
    const lastNumber = parseInt(nameArr[nameArr.length - 1]) + 1;
    let concatenatedName = '';
    for (let i = 0; i < nameArr.length - 1; i++) {
        concatenatedName += nameArr[i];
    }
    const finalResult = `${concatenatedName}-${lastNumber}`;
    if (facet.filter(e => e.name === finalResult).length > 0) {
        return getIncreasedElementNameNumber(finalResult, facet, currNumber + 1);
    }
    return finalResult;
}

const getElementTypeFromName = (name) => {
    const strSplit = name.split('>');
    let elementType = strSplit[strSplit.length - 1];
    const elementTypeSplit = elementType.split(':');
    elementType = elementTypeSplit[0];
    return elementType;
}

const convertToDomElementObject = (path, facet) => {
    const elementType = getElementTypeFromName(path);
    let elementName = elementType;
    while (facet.filter(e => e.name === elementName).length > 0) {
        elementName = getIncreasedElementNameNumber(elementType, facet);
    }
    return {
        name: elementName,
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

const removeDomPath = (facetMap, domPath, setFacetMap, selectedFacet, enqueueSnackbar) => {
    facetMap && facetMap.forEach((facet, key) => {
        var newFacetArr = facet.filter(e => e.path !== domPath);
        if (facet.length !== newFacetArr.length) {
            if (key !== selectedFacet) {
                enqueueSnackbar({
                    message: `Element was moved to ${key} from ${selectedFacet}`,
                    variant: snackbar.info.text
                });
            }
            setFacetMap(new Map(facetMap.set(key, newFacetArr)));
            return;
        }
    });
}

/**
 *  @param {*} facetMap
 *  @param {*} setNonRolledOutFacetsValue
 */
const loadInitialStateInDOM = (facetMap, setNonRolledOutFacetsValue) => {
    let nonRolledOutFacets = [];
    const facetArray = Array.from(facetMap, ([name, value]) => ({ name, value }));
    facetArray && facetArray.forEach(facet => {
        const value = facet.value;
        if (value.enabled) {
            nonRolledOutFacets.push(facet.name);
        }

        value.forEach(val => {
            if (!val.enabled) {
                return;
            }
            const path = parsePath(val.path, true);
            $(path[0]).css("opacity", "0.3", "important");
            $(val.path).css("opacity", "0.3", "important");
        })
    });
    setNonRolledOutFacetsValue(nonRolledOutFacets);
}

/**
 * DOM Event Listener of Facet selection
 */
const onMouseClickHandle = function (event) {
    const selectedFacet = getSelectedFacet();
    const facetMap = getFacetMap();
    const setFacetMap = event.currentTarget.setFacetMap;
    const setNonRolledOutFacets = event.currentTarget.setNonRolledOutFacets;
    const enqueueSnackbar = event.currentTarget.enqueueSnackbar;
    const setGlobalFacets = event.currentTarget.setGlobalFacets;
    let facet = facetMap.get(selectedFacet) || [];
    const domPath = getDomPath(event.target);
    const allPaths = extractAllDomElementPathsFromFacetMap(facetMap);
    if (facetMap.size === 0) {
        setGlobalFacets([selectedFacet])
    }
    if (facetMap.size === 0) {
        setNonRolledOutFacets([selectedFacet])
    }
    if (allPaths.includes(domPath)) {
        removeDomPath(facetMap, domPath, setFacetMap, selectedFacet, enqueueSnackbar);
        event.target.style.setProperty("opacity", "unset");
    } else {
        const domElementObj = convertToDomElementObject(domPath, facet);
        facet.push(domElementObj);
        setFacetMap(new Map(facetMap.set(selectedFacet, facet)));
        if (nonRolledOutFacetsHighlighter.includes(selectedFacet)) {
            event.target.style.setProperty("opacity", "0.3", "important");
        }
    }
    event.preventDefault();
    event.stopPropagation();
}

function getDomPath(el) {
    if (!el || !isElement(el)) {
        return '';
    }
    var stack = [];
    var isShadow = false;
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
        var nodeName = el.nodeName.toLowerCase();
        if (isShadow) {
            nodeName += "::shadow";
            isShadow = false;
        }
        if (sibCount > 1) {
            if (sibIndex === 0) {
                stack.unshift(nodeName);
            } else {
                stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
            }
        } else {
            stack.unshift(nodeName);
        }
        el = el.parentNode;
        if (el.nodeType === 11) {
            isShadow = true;
            el = el.host;
        }
    }
    var res = stack.slice(1).join(' > ');
    return res.replace(/ /g, "");
}

/**
 * Returns whether a given element in an HTML element or not
 *
 * @param element
 * @returns {boolean}
 */
function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}

/**
 * 
 * @param {*} addEventsFlag Determines whether events will be added or removed from the DOM
 * @param {*} facetMap Map of facets
 * @param {*} enqueueSnackbar notification context
 */
const updateEvents = async (addEventsFlag, facetMap, setFacetMap, eSBar, setNonRolledOutFacets, setGlobalFacets) => {
    try {
        if (!workspaceId) {
            initializeSingletonValues(eSBar);
        }

        [...document.querySelectorAll('* > :not(#facetizer) * > :not(#popup) *')]
            .filter(e => ![...document.querySelectorAll("#facetizer *, #popup *, #facet-menu *")]
                .includes(e)).forEach(e => {
                    // attaching these parameters into the event
                    e.facetMap = facetMap;
                    e.setFacetMap = setFacetMap;
                    e.enqueueSnackbar = eSBar;
                    e.setNonRolledOutFacets = setNonRolledOutFacets;
                    e.setGlobalFacets = setGlobalFacets;
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

/**
 * Detects whether the facet script has already been injected in the DOM
 */
const scriptHasAlreadyBeenInjected = () => {
    const scriptArr = document.querySelectorAll('script');
    let found = false;
    scriptArr.forEach(script => {
        if (found) {
            return;
        }
        if (script.getAttribute('src') && script.getAttribute('src').includes('https://api.facet.run/js')) {
            found = true;
        }
    });
    return found;
}

const initializeSingletonValues = async (eSBar) => {
    workspaceId = await getKeyFromLocalStorage(api.workspace.workspaceId);
    let getDomainRes = await getOrPostDomain(workspaceId);
    domainId = getDomainRes.response[0].id;
    enqueueSnackbar = eSBar;
}

export {
    updateEvents, onMouseEnterHandle, loadInitialStateInDOM,
    performDOMTransformation, setSelectedFacetHighlighter, scriptHasAlreadyBeenInjected,
    setFacetMapHighlighter, setNonRolledOutFacetsHighlighter, isSelectorValid
};