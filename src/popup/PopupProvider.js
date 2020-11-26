/*global chrome*/

import React, { useState, useEffect } from 'react';
import PopupContext from './PopupContext';
import { getKeyFromLocalStorage, setKeyInLocalStorage } from '../shared/loadLocalStorage'
import { LoginTypes, storage, api, authState as authStateConstant } from '../shared/constant';
import { getOrCreateWorkspace } from '../services/facetApiService';
import triggerDOMReload from '../shared/popup/triggerDOMReload';
import AmplifyService from '../services/AmplifyService';
import { Auth } from 'aws-amplify';

export default ({ children }) => {
    // email,id:  
    const [loggedInUser, setLoggedInUser] = useState({});
    const [url, setUrl] = useState('');
    const [isPluginEnabled, setIsPluginEnabled] = useState(true);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [workspaceId, setWorkspaceId] = useState(undefined);
    const [jwt, setJwt] = useState('');
    // deprecate this..
    const [loadLogin, setLoadLogin] = useState(false);
    const [currAuthState, setCurrAuthState] = useState(authStateConstant.signingIn);

    const login = async () => {
        const workspaceResponse = await getOrCreateWorkspace(email);
        setIsUserAuthenticated(true);
        await setKeyInLocalStorage(api.workspace.workspaceId, workspaceResponse.response.workspaceId);
        await setKeyInLocalStorage(storage.isPluginEnabled, true);
        await setKeyInLocalStorage(LoginTypes.email, email);
        triggerDOMReload();
    }

    const onLoginClick = (val) => {
        setLoadLogin(val);
    }

    // useEffect(() => {
    //     (async () => {
    //         loadLocalStorage(setIsPluginEnabled, setIsUserAuthenticated);

    //         const loadURL = () => {
    //             chrome.tabs && chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    //                 let websiteUrl = tabs[0] && tabs[0].url;
    //                 setUrl(websiteUrl);
    //             });
    //         }
    //         loadURL();
    //         loadLocalStorage(setIsPluginEnabled, setIsUserAuthenticated, setWorkspaceId);
    //     })();
    // }, [setIsPluginEnabled, setIsUserAuthenticated, setWorkspaceId]);

    const loadJWT = async () => {
        const jwt = await AmplifyService.getCurrentUserJTW();
        setJwt(jwt);
    }

    const signInExistingUser = async () => {
        try {
            const username = await getKeyFromLocalStorage(storage.username);
            const password = await getKeyFromLocalStorage(storage.password);
            await Auth.signIn(username, password);
            setCurrAuthState(authStateConstant.signedIn);
        } catch (e) {
            console.log('[ERROR][signInExistingUser]', e);
        }
    }

    useEffect(() => {
        loadJWT();
        signInExistingUser();
    }, [setJwt]);

    // useEffect(() => {
    //     loadLocalStorage(setIsPluginEnabled, setIsUserAuthenticated);

    //     const loadURL = () => {
    //         chrome.tabs && chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    //             let websiteUrl = tabs[0] && tabs[0].url;
    //             setUrl(websiteUrl);
    //         });
    //     }

    //     loadURL();
    //     loadLocalStorage(setIsPluginEnabled, setIsUserAuthenticated, setWorkspaceId);
    // }, [setIsPluginEnabled, setIsUserAuthenticated, setWorkspaceId]);

    return <PopupContext.Provider value={{
        loggedInUser, setLoggedInUser, url, setUrl, isPluginEnabled,
        setIsPluginEnabled, login, isUserAuthenticated, setIsUserAuthenticated,
        workspaceId, email, setEmail, loadLogin, setLoadLogin, onLoginClick,
        currAuthState, setCurrAuthState, jwt, setJwt
    }}>
        {children}
    </PopupContext.Provider>
}