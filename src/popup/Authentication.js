import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PopupContext from './PopupContext';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import { LoginTypes } from '../shared/constant';
import Button from '@material-ui/core/Button';
import isValidEmail from './isValidEmail';

const useStyles = makeStyles((theme) => ({
    formControl: {
        width: '100%',
        minWidth: 120
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        width: '100%',
    },
    span: {
        fontSize: '1.2rem',
    }
}));

const GridDiv = styled.div`
    display: grid;
    row-gap: .3rem;
    align-items: center;
    padding: 1rem;
`;

export default () => {
    const classes = useStyles();
    const { setSelectedWayOfLogin, login, email, setEmail } = useContext(PopupContext);

    return <div>
        {/* <form> */}
        <GridDiv>
            <div className={classes.span}>
                <span >Please enter your email:</span>
            </div>
            <div>
                <TextField
                    error={!isValidEmail(email)}
                    helperText={!isValidEmail(email) ? 'Please insert a valid email.' : ''}
                    errorText=''
                    className={classes.button}
                    onChange={(e) => { setEmail(e.target.value) }}
                    id="outlined-basic"
                    variant="outlined" type='email'
                    placeholder="example@email.com" />
            </div>
            <div>
                <Button
                    // type="submit"
                    disabled={!isValidEmail(email)}
                    style={{ width: '100%' }}
                    onClick={() => login()}
                    variant="contained"
                    color="secondary"
                    size="small">Login
                </Button>
            </div>
        </GridDiv>
        {/* </form> */}
    </div>
}