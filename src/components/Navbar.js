import React from 'react';
import { NavLink } from "react-router-dom";
import './components.css';

/**
 * references:
 *  https://blog.logrocket.com/creating-navbar-react/
 *  https://stackoverflow.com/questions/63124161/attempted-import-error-switch-is-not-exported-from-react-router-dom
 *  https://staceycarrillo.medium.com/highlight-the-active-navigation-bar-link-using-navlink-in-react-d44f5d8bf997
 *  https://www.codegrepper.com/code-examples/javascript/In+React+Router+v6%2C+activeStyle+will+be+removed+and+you+should+use+the+function+style+to+apply+inline+styles+to+either+active+or+inactive+NavLink+components.
 */
export default function Navbar() {
  return (
    <div>
      <nav className="Navbar">
        <NavLink to="/" className="Navtab">About</NavLink>
        <NavLink to="/login" className="Navtab">LogIn</NavLink>
        <NavLink to="/upload" className="Navtab">Upload</NavLink>
        <NavLink to="/explore" className="Navtab">Explore</NavLink>
      </nav>
    </div>
  );
}