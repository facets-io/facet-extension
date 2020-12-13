/* global chrome */

import React, { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import $ from 'jquery';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import { defaultFacet, styles, APIUrl } from '../shared/constant';
import StyledTreeItem from './StyledTreeItem';
import parsePath from '../shared/parsePath';
import AppContext from '../AppContext';
import { color } from '../shared/constant.js';
import facetTypography from '../static/images/facet_typography.svg';
import FacetImage from '../shared/FacetImage';
import settingsLogo from '../static/images/facet_settings.svg';
import logoutLogo from '../static/images/facet_logout.svg';
import logoutLogoHover from '../static/images/facet_logout_hover.svg';
import facetProfileLogo from '../static/images/facet_profile.svg';
import facetEnableLogo from '../static/images/facet_button.svg';
import facetEnableHoverLogo from '../static/images/facet_button_hover.svg'
import resetLogo from '../static/images/facet_restart_button.svg';
import resetLogoHover from '../static/images/facet_restart_hover.svg';
import saveFacetLogo from '../static/images/facet_save.svg';
import saveFacetLogoHover from '../static/images/facet_Save_hover.svg';
import copySnippetLogo from '../static/images/facet_copy_snippet_button.svg';
import copySnippetHoverLogo from '../static/images/facet_copy_snippet_hover.svg';
import styled from 'styled-components';
import FacetIconButton from '../shared/FacetIconButton/FacetIconButton';
import Fab from '@material-ui/core/Fab';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FacetLabel from '../shared/FacetLabel';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
  },
  oneLineGrid: {
    display: 'grid',
    gridTemplateColumns: '90% 10%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawer: {
    width: styles.drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    backgroundColor: color.darkGray,
    width: styles.drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
  },
  treeView: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400,
  },
  margin: {
    marginRight: 20,
  },
  saveBtn: {
    position: 'absolute',
    bottom: 0,
  },
  centered: {
    textAlign: 'center',
  },
  logo: {
    width: '50%',
  },
  gridDiv: {
    display: 'grid'
  },
  fabGrid: {
    display: 'grid',
    alignItems: 'end',
    justifyContent: 'end',
    margin: '1rem',
  },
  fabBtn: {
    color: color.ice,
    backgroundColor: color.darkGray,
    '&:hover': {
      backgroundColor: color.darkGray,
    },
  }
}));

const TopDiv = styled.div`
    display: grid;
    grid-template-columns: 70% 10% 10%;
    grid-gap: 5%;
    align-items: center;
    justify-content: center;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
`;

export default function FacetTreeSideBar() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const {
    facetMap, setFacetMap, setSelectedFacet, loadingSideBar, logout,
    showSideBar, setShowSideBar, reset, onSaveClick, textToCopy, handleCloseMenuEl,
    facetLabelMenu, setFacetMenuLabel, selected, setSelected, onDeleteFacet,
    expanded, setExpanded, onDeleteDOMElement
  } = useContext(AppContext);
  const [renamingFacet, setRenamingFacet] = useState();
  const facetArray = Array.from(facetMap, ([name, value]) => ({ name, value }));
  useEffect(() => { setExpanded(['Facet-1']); }, []);

  console.log('selected', selected);
  console.log('expanded', expanded);

  const addFacet = (autoNumber = facetMap.size + 1) => {
    console.log('@ADDFACET')
    const newName = `Facet-${autoNumber}`;
    if (facetMap.get(newName)) {
      addFacet(autoNumber + 1);
      return;
    }
    setFacetMap(facetMap.set(newName, []));
    setSelectedFacet(newName);
    setSelected(newName);
    setExpanded([newName]);
  };

  const sideBarHandler = () => {
    // window.highlightMode = showSideBar;
    setShowSideBar(!showSideBar);
    if (!showSideBar) {
      // TODO removeEventListeners
    }
  };

  // TODO duplicate, re-use function from highlighter
  const onMouseEnterHandle = function (path) {
    $(path).css('outline', '5px ridge #c25d29');
    $(path).css('cursor', 'pointer');
  };

  // TODO duplicate, re-use function from highlighter
  const onMouseLeaveHandle = function (path) {
    $(path).css('outline', 'unset');
    $(path).css('cursor', 'unset');
  };

  const handleNodeIdToggle = (event, nodeIds) => {
    // setExpanded(nodeIds);
  };

  const handleNodeIdsSelect = (event, nodeId) => {
    // setSelected([nodeId]);
    // setSelectedFacet(nodeId);
    // if (expanded.includes(nodeId)) {
    //   setExpanded([]);
    // } else {
    //   setExpanded([nodeId]);
    // }

    // // contains logic for allowing one selection at a time
    // const fArray = Array.from(facetMap, ([name, value]) => ({ name, value }));
    // if (fArray.find((e) => e.name === nodeId)) {
    //   setSelected([nodeId]);
    //   setSelectedFacet(nodeId);
    //   if (expanded.includes(nodeId)) {
    //     setExpanded([]);
    //   } else {
    //     setExpanded([nodeId]);
    //   }
    // }
  };

  const itemsElement = loadingSideBar ? <FacetLabel text="Loading..." />
    : facetArray.map((facet) => {
      const { value } = facet;

      return (
        <StyledTreeItem
          nodeId={facet.name}
          key={facet.name}
          labelText={`${facet.name}`}
          labelIcon={ChangeHistoryIcon}
          // onDeleteItem={(e) => { onDeleteFacet(e); }}
          onRenameItem={() => { setRenamingFacet(facetLabelMenu); handleCloseMenuEl(); }}
          onRenameCancelClick={() => setRenamingFacet(undefined)}
          onRenameSaveClick={(e) => {
            facetMap.set(e, facetMap.get(facet.name));
            facetMap.delete(facet.name);
            setFacetMap(new Map(facetMap));
            handleCloseMenuEl();
          }}
          renamingFacet={renamingFacet === facet.name}
          onLabelClick={(e) => {
            e.preventDefault();
            // console.log('CLICKED', facet.name);
            // setSelected(facet.name);
            // setSelectedFacet(facet.name);
            // setExpanded([facet.name])
          }}
          isFacet={true}
        >
          {value && value.map((domElement, index) => (
            <StyledTreeItem
              onMouseOver={() => onMouseEnterHandle(domElement.path)}
              onMouseLeave={() => onMouseLeaveHandle(domElement.path)}
              nodeId={`${facet.name}-element-${index + 1}`}
              key={`${facet.name}-element-${index + 1}`}
              labelText={domElement.name}
              labelIcon={WebAssetIcon}
              onDeleteItem={() => {
                // TODO move on individual function
                console.log('triggaara!', domElement);
                onDeleteDOMElement(domElement.path);
                let arr = facetMap.get(facet.name);
                arr = arr.filter((e) => e.name !== domElement.name);
                facetMap.set(facet.name, arr);
                setFacetMap(new Map(facetMap.set(facet.name, arr)));
              }}
              isFacet={false}
            />
          ))}
        </StyledTreeItem>
      );
    });

  const activateDeactivateElement = showSideBar
    ? (
      <FacetIconButton isSelected={true} name="keypad-outline" onClick={() => sideBarHandler()} title="Disable" aria-label="Disable" />
    ) : (
      <FacetIconButton name="keypad-outline" onClick={() => sideBarHandler()} title="Enable" aria-label="Enable" />
    );

  return (
    <div className={classes.root}>
      <div>
        <Drawer
          // className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.gridDiv}>
            <TopDiv>
              <div>
                <FacetImage src={facetTypography} />
              </div>
              <div>
                <FacetIconButton onClick={() => {
                  console.log('KLIKARISTIKA');
                  chrome.runtime.sendMessage({
                    msg: "auth",
                    data: {
                      subject: "Loading",
                      content: "Just completed!"
                    }
                  });
                }} name="info-outline" />
              </div>
              <div>
                <FacetIconButton onClick={() => { logout() }} name="log-out-outline" size="large" />
              </div>
            </TopDiv>
            <br />
            <Divider style={{ backgroundColor: color.lightGray }} />
            <div className={classes.drawerHeader}>
              {activateDeactivateElement}
              <FacetIconButton name="refresh-outline" onClick={() => { reset(); }} title="Reset" size="small" aria-label="Reset" />
              <FacetIconButton name="save-outline" onClick={() => { onSaveClick(); }} size="small" aria-label="add" />
              <CopyToClipboard text={textToCopy}>
                <FacetIconButton name="copy" onClick={() => { }} size="small" aria-label="Save" />
              </CopyToClipboard>
            </div>
            <div className={classes.oneLineGrid}>
              <div>
                <h3 style={{ color: color.lightGray, marginLeft: '1rem' }}>My Facets</h3>
              </div>
              <div>
                <div className={classes.fabGrid}>
                  <Fab onClick={() => addFacet()} size='small' className={classes.fabBtn} aria-label="add">
                    <AddIcon />
                  </Fab>
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <TreeView
            className={classes.treeView}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            selected={selected}
          // disableSelection={true}
          // onNodeToggle={handleNodeIdToggle}
          // onNodeSelect={handleNodeIdsSelect}
          >
            {itemsElement}
          </TreeView>
        </Drawer>

      </div>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
      </main>
    </div>
  );
}
