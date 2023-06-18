import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <div className='headerContainer'>
            <div className='logo'>
                {/* add logo here */}
            </div>
            <div className='pageContainer'>
                <Link className='headerText' to='/'>Home</Link>
                <Link className='headerText' to='/group'>Create Group</Link>
                <Link className='headerText' to='/upload'>Upload Food</Link>
                <Link className='headerText' to='/login'>Login</Link>
            </div>
        </div>
    );
}

export default Header;
