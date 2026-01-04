import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import "./sidebar.css"

const Sidebar = ({openCreatePost}) => {
    const { user } = useAuth()
    return (
        <div className='sidebar'>
            {/* <h2 className='logo'>SocialHub</h2> */}

            <ul>
                <li>
                    <NavLink to="/home" className="navLink">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/saved" className="navLink">Saved</NavLink>
                </li>
                <li>
                    <NavLink to="/Liked" className="navLink">Liked</NavLink>
                </li>
                <li>
                    <button className="navLink" onClick={openCreatePost}>
                        Create
                    </button>
                </li>
                <li>
                    <NavLink to={`/profile/${user?._id}`} className="navLink">Profile</NavLink>
                </li>
            </ul>

        </div>
    )
}

export default Sidebar
