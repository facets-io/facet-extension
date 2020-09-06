/*global chrome*/
import React, { Component, useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import styled from 'styled-components';
import AppContext from './AppContext';

const StyledDiv = styled.div`
    width: 100%;
    color: white;
`;

function FacetSwitch() {
    const [isEnabled, setIsEnabled] = React.useState(true);

    const handleChange = () => {
        // setIsEnabled(!isEnabled);
        window.facetProvider.setIsEnabled(!window.facetProvider.isEnabled);
        setIsEnabled(!isEnabled);
    };

    return (
        <StyledDiv>
            <Grid
                style={{ height: '100%' }}
                container
                justify="center"
                container>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isEnabled}
                            onChange={handleChange} />}
                    label={isEnabled ? "Navigate" : "Edit"}
                />
            </Grid>
        </StyledDiv >
    );
}

export default FacetSwitch;