import React from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Banner from './Banner';
import Aboutus from './Aboutus';
import Events from './Events';
import Footer from './Footer';

const Home = () => {
    return (
        <div>
           <Header></Header> 
           <Navbar></Navbar>
           <Banner></Banner>
           <Aboutus></Aboutus>
           <Events></Events>
           <Footer></Footer>
        </div>
    );
};

export default Home;