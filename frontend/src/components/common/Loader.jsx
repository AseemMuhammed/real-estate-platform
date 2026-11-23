import React from 'react';

const Loader = ({ fullPage = false, label }) => (
    <div className={fullPage ? 'loader-full-page' : 'loader-container'}>
        <div className="flex flex-col items-center gap-4">
            <span className="loader" />
            {label && <p className="text-sm text-text-muted">{label}</p>}
        </div>
    </div>
);

export default Loader;
