import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import './components.css';
import jwt_decode from "jwt-decode"; //decode json web token

/**
 * references:
 *  https://blog.logrocket.com/creating-navbar-react/
 *  https://stackoverflow.com/questions/63124161/attempted-import-error-switch-is-not-exported-from-react-router-dom
 *  https://staceycarrillo.medium.com/highlight-the-active-navigation-bar-link-using-navlink-in-react-d44f5d8bf997
 *  https://www.codegrepper.com/code-examples/javascript/In+React+Router+v6%2C+activeStyle+will+be+removed+and+you+should+use+the+function+style+to+apply+inline+styles+to+either+active+or+inactive+NavLink+components.
 */
export default function Navbar() {
  /*----Google OAuth----*/

  const [ g_user, setG_user] = useState({});
  const handleCallbackResponse=(res)=>{
      
  var userObject = jwt_decode(res.credential); //decoding the token
  console.log(userObject);
      setG_user(jwt_decode(res.credential));
      document.getElementById("signInDiv").hidden = true;
  document.getElementById("uploadAvail").hidden = false;
  }
  
  const handleSignOut=(e)=>{
      setG_user({});
      document.getElementById("signInDiv").hidden = false;
  
  }
  useEffect(()=>{
      /*global google*/
      google.accounts.id.initialize({
          client_id:"1040045622206-ivnovfjcd4jq58rbrcrm49qd7ra52d2l.apps.googleusercontent.com",
          callback: handleCallbackResponse //a function called after logged in
      });
      google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          {theme:"outline",size:"large",width: 100,text:"signin_with"}
      );
      // google.accounts.id.prompt();
  },[]);

  return (
    <div>
      <nav className="Navbar">
        <NavLink to="/about" className="Navtab">About</NavLink>
        {/* <NavLink to="/" className="Navtab">Upload</NavLink> */}
        <NavLink to="/upload" className="Navtab">Upload</NavLink>
        <NavLink to="/explore" className="Navtab">Explore</NavLink>
        <NavLink to="/admin" className="Navtab">Admin</NavLink>
        
        <section>
				<div id="signInDiv"> Click here</div>
        {Object.keys(g_user).length>0 &&
					<button onClick={(e)=> handleSignOut()} className="login_navbar">Sign Out</button>
				}
        {g_user &&
				<span>
					<img class="ProfilePic" src={g_user.picture}></img>
					<span>{g_user.name}</span>
				</span>
        }
        </section>
      </nav>
    </div>
  );
}