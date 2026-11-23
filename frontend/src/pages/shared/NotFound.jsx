import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';

const NotFound = () => (
    <div className="min-h-screen bg-bg-alt">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <p className="text-[7rem] font-extrabold text-gradient leading-none">404</p>
            <h1 className="text-3xl font-extrabold text-text-main mt-4">Page not found</h1>
            <p className="text-text-muted mt-3 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
            <div className="flex gap-3 mt-8 flex-wrap justify-center">
                <Link to="/" className="btn btn-primary"><HiOutlineHome /> Back Home</Link>
                <Link to="/properties" className="btn btn-outline bg-white">Browse Properties</Link>
            </div>
        </div>
    </div>
);

export default NotFound;
