import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Nav from './component/nav/Nav'
import Chart from './component/chart/Chart'
import Axios from './component/axios/Axios'

function App() {


  return (
    <>
      <Nav></Nav>
      <h1 className='text-center md:text-3xl'>Welcome To our Tailwind project</h1>
      <Chart></Chart>
      <Axios></Axios>
    </>
  )
}

export default App
