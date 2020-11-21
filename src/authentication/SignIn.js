import { Auth } from "aws-amplify";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import PopupContext from "../popup/PopupContext";
import { authState as authStateConstant } from '../shared/constant';
import "./styles.css";

export default () => {
  const { setCurrAuthState } = React.useContext(PopupContext);
  const { register, errors, handleSubmit, watch } = useForm({});
  const password = useRef({});
  password.current = watch("password", "");
  const onSubmit = async data => {
    console.log(JSON.stringify(data));
    const { email, password } = data;
    try {
      
      const user = await Auth.signIn(email, password);
      console.log('USER!', user);
      setCurrAuthState(authStateConstant.signedIn);
    } catch (error) {
      console.log('error signing in', error.code);
      if (error.code === 'UserNotConfirmedException') {
        setCurrAuthState(authStateConstant.confirmingSignup);
      }
    }
  };

  return (
    <React.Fragment>
      <form onSubmit={e => e.preventDefault()}>
        <label htmlFor="email">email</label>
        <input
          id="email"
          name="email"
          aria-invalid={errors.email ? "true" : "false"}
          ref={register({
            required: "required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format"
            }
          })}
          type="email"
          placeholder="example@mail.com"
        />
        {errors.email && <span role="alert">{errors.email.message}</span>}

        <label>Password</label>
        <input
          name="password"
          type="password"
          ref={register({
            required: "You must specify a password",
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <input type="submit" onClick={handleSubmit(onSubmit)} />
      </form>
      <div>
        <span><a onClick={() => setCurrAuthState(authStateConstant.signingUp)}>Don't have an account? Signup</a></span>
      </div>

    </React.Fragment >
  );
}