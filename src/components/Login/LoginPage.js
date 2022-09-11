import React, { useRef, useState, useEffect, useContext } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from "../../firebase";
import { getDatabase, onValue, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import "../components.css";
import AuthContext from "./AuthProvider";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const LOGIN_URL = "/auth"; //append to baseURL in axios.js
const db = getDatabase();


export default function LoginPage(props) {
	const { setAuth } = useContext(AuthContext);
	const userRef = useRef();
	const errRef = useRef();

	// const [user, setUser] = useState("");
	// const [pwd, setPwd] = useState("");
	// const [errMsg, setErrMsg] = useState("");
	const [success, setSuccess] = useState("");
    const [signUp, setSignUp] = useState("");

	useEffect(() => {
		userRef.current.focus(); //set the focus on the first input when the component loads
	}, []);

	// useEffect(() => {
	// 	props.setErrMsg("");
	// }, [props.user, props.pwd]); //empty the error msg whenever the user change either username or pwd

	const handleSubmit = async (e) => {
		e.preventDefault(); //prevent component reload after form being submitted
        await get(ref_db(db, "users/"+props.user)).then((snapshot) => {
			console.log("Size of 'users' folder in database:" + snapshot.size); //DEBUG
			if(!snapshot.exists()) { // check existence of this username
                props.setErrMsg('Nonexisting user');
			}
			else{
				console.log("snapshot::::", typeof snapshot.val().pwd, typeof props.pwd);
				if(String(snapshot.val().pwd)===props.pwd){
                    setSuccess(true);
                    console.log("true");
                }
                else{
                    console.log("false");
                    props.setErrMsg("Your username or password is incorrect. Try again.");
                }
            }
		});

		// try{
        //     const response = await axios.post(
        //         LOGIN_URL,
        //         JSON.stringify({ user, pwd }),
        //         { headers: { 'Content-Type': 'application/json' },
        //           withCredentials: true
        //         }
        //     );
        //     console.log(JSON.stringify(response?.data)); //response is an object consists of data, status, headers, etc.
        //     const accessToken = response?.data?.accessToken; 
        //     const roles = response?.data?.roles; //from authController.js
        //     setAuth({ user, pwd, roles, accessToken });
            console.log("user,pwd:" + props.user, props.pwd);
        //     setUser("");
        //     setPwd("");
        //     setSuccess(true);
        // }
        // catch(err){
        //     if (!err?.response) {
        //         setErrMsg('No Server Response');
        //     } else if (err.response?.status === 400) {
        //         setErrMsg('Missing Username or Password');
        //     } else if (err.response?.status === 401) {
        //         setErrMsg('Unauthorized');
        //     } else {
        //         setErrMsg('Login Failed');
        //     }
        //     errRef.current.focus();
        // }
        // props.setUser('');
        // props.setPwd('');
        // setSuccess(true);
	};

    const navigate = useNavigate();
    const handleRedirect = (e,destination) => {
        navigate(destination);
        e.preventDefault(); //prevent reloading the page 
    };
    

	/* Render */
	return (
		<div className="PageBox PageBox_Login">
			<div className="Login_body">
				<div className="Login_box">
					<>
						{success ? (
							<section>
								<h1>You are logged in!</h1>
								<br />
								<p>
                                    <a onClick={e=>handleRedirect(e,'/upload')} href='/upload'> Go to Upload page </a>
								</p>
							</section>
						) : (
							<section>
                                <p ref={errRef} className={props.errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{props.errMsg}</p>
								<form onSubmit={handleSubmit}>
									<label htmlFor="username">Username:</label>
									<input
										type="text"
										id="username"
										onChange={(e) => props.setUser(e.target.value)}
										ref={userRef}
										autoComplete="off"
										value={props.user}
										required
									/>
									<label htmlFor="password">password:</label>
									<input
										type="password"
										id="password"
										onChange={(e) => props.setPwd(e.target.value)}
										ref={userRef}
										value={props.pwd}
										required
									/>
                                    <br />
									<button>Sign In</button>
								</form>
								<p>
									Need an Account?
									<br />
									<span className="line">
                                        <a onClick={e=>handleRedirect(e,'../SignUp')} href='../SignUp'> Sign Up </a>
									</span>
								</p>
							</section>
						)}
					</>
				</div>
			</div>
		</div>
	);
    
}

