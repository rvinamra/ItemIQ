import Layout from "./Layout.jsx";

import ProcessTransactions from "./ProcessTransactions";

import Home from "./Home";

import SurveyInsights from "./SurveyInsights";

import StatementsDemo from "./StatementsDemo";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    ProcessTransactions: ProcessTransactions,
    
    Home: Home,
    
    SurveyInsights: SurveyInsights,
    
    StatementsDemo: StatementsDemo,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<ProcessTransactions />} />
                
                
                <Route path="/ProcessTransactions" element={<ProcessTransactions />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/SurveyInsights" element={<SurveyInsights />} />
                
                <Route path="/StatementsDemo" element={<StatementsDemo />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}