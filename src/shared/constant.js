import isDevelopment from "../utils/isDevelopment";
const facetizerId = 'facetizer';
const facetKey = 'facet-settings'
const isPluginEnabled = 'isPluginEnabled';
const isUserAuthenticated = 'isUserAuthenticated';
const apiBaseURL = 'https://api.facet.run';
const testBaseURL = 'https://test.api.facet.run';
const localBaseURL = 'http://localhost:3002';
const websiteURL = 'https://facet.run';

const authState = {
    notSignedIn: 'NOT_LOGGED_IN',
    signedIn: 'LOGGED_IN',
    signingIn: 'SIGNING_IN',
    signUp: 'SIGN_UP',
    signingUp: 'SIGNING_UP',
    confirmingSignup: 'CONFIRMING_SIGNUP',
    onForgotPassword: 'FORGOT_PASSWORD',
    onPasswordReset: 'PASSWORD_RESET'
};

const fontSize = {
    xxSmall: 'xx-small',
    xSmall: 'x-small',
    small: 'small',
    medium: 'medium',
    large: 'large',
    xLarge: 'x-large',
    xxLarge: 'xx-large',
    xxxLarge: 'xxx-large'
};

const color = {
    electricA: '#5979D9',
    electricB: '#758EBF',
    ice: '#C4DDF2',
    lightGray: '#8B8E93',
    grayA: '#4A4E59',
    darkGray: '#181D26',
    darkestGray: '#13171E',
    black: '#000000',
    redError: '#CD0F11',
    menuDivider: '#696969',
    white: '#FFFFFF',
    menuColor: {
        red: '#ED4D4D',
        lightGreen: '#8EB914',
        lightBlue: '#23E7DB',
        lightPurple: '#927EE2',
        green: '#00D222'
    },
};

const snackbar = {
    success: {
        text: 'success',
        iconName: 'checkmark-circle-2-outline',
        fill: 'green'
    },
    error: {
        text: 'error',
        iconName: 'alert-circle-outline',
        fill: color.redError
    },
    info: {
        text: 'info',
        iconName: 'message-circle-outline',
        fill: color.ice
    }
};

// information persisted in sync.storage
const authStorage = {
    username: 'USERNAME',
    sessionToken: 'SESSION_TOKEN'
};

const styles = {
    drawerWidth: 300
};

const APIUrl = {
    apiBaseURL,
    testBaseURL,
    localBaseURL,
    activeBaseURL: isDevelopment() ? localBaseURL : apiBaseURL,
    websiteURL
};

const LoginTypes = {
    email: 'email',
    workspaceId: 'workspaceId'
};

const storage = {
    isPluginEnabled,
    isUserAuthenticated,
    username: 'username',
    password: 'password',
    initiatingTabId: 'INITIATING_TAB_ID',
    sessionData: 'SESSION_DATA',
    isPreview: 'IS_PREVIEW'
};

const ChromeRequestType = {
    GET_LOGGED_IN_USER: 'GET_LOGGED_IN_USER',
    OPEN_WELCOME_PAGE: 'OPEN_WELCOME_PAGE',
    OPEN_PREVIEW_PAGE: 'OPEN_PREVIEW_PAGE',
    GET_CURRENT_TAB: 'GET_CURRENT_TAB',
    SET_COOKIE_VALUE: 'SET_COOKIE_VALUE'
};

const cookieKeys = {
    FACET_EXTENSION_PREVIEW_TAB_ID: 'FACET_EXTENSION_PREVIEW_TAB_ID',
    FACET_EXTENSION_DISABLE_MO: 'FACET_EXTENSION_DISABLE_MO',
    FACET_EXTENSION_ALREADY_INTEGRATED: 'FACET_EXTENSION_ALREADY_INTEGRATED',
    FACET_EXTENSION_INJECTING_SCRIPT_TAG: 'FACET_EXTENSION_INJECTING_SCRIPT_TAG',
};

const api = {
    domainId: 'domainId',
    workspace: {
        workspaceId: 'workspaceId'
    },
    facetObjectVersion: '0.0.1'// TODO ideally this matches the manifest version
};

const HTTPMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

const domIds = {
    popup: 'popup',
    authentication: 'authentication',
    facetizer: 'facetizer',
    welcome: 'facet-welcome-page',
    previewLoadingBar: 'facet-preview-loading-bar'
};

// chrome extension id
const appId = 'hpkpjkdhgldjhcopdkmljdgceeojoglh';

// helper during local debugging
const isActivelyBeingDebugged = (id) => {
    const activelyDebuggingElementIds = [domIds.facetizer];
    if (!isDevelopment()) {
        return true;
    }
    return activelyDebuggingElementIds.includes(id);
};

const defaultFacetName = 'Facet-1';

export {
    facetizerId, facetKey, isPluginEnabled, snackbar,
    storage, LoginTypes, api, HTTPMethods,
    APIUrl, styles, authState, cookieKeys,
    authStorage, ChromeRequestType, color, fontSize,
    isActivelyBeingDebugged, domIds, appId, defaultFacetName
};
