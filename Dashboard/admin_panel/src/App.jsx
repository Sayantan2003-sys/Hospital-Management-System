import React, { useContext, useEffect } from "react"
import "./App.css"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import DashBoard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import AddNewAdmin from "./components/AddNewAdmin";
import Message from "./components/Message";
import Doctors from "./components/Doctors";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from "./main";
import axios from "axios";

const App = () => {

  const {isAuthenticated, setIsAuthenticated, admin, setAdmin} = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
      const response = await axios.get("http://localhost:4000/api/v1/user/admin/me", 
        {withCredentials: true}
      );
      setIsAuthenticated(true);
      setAdmin(response.data.user);
      } catch (error) {
        setIsAuthenticated(false)
        setAdmin({});
      }
    };
    fetchUser();
  },[isAuthenticated]);


  return(
    <>
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashBoard />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/messages" element={<Message />} />
        <Route path="/doctors" element={<Doctors />} />
      </Routes>
      <ToastContainer position='top-center' />
    </Router>
    </>
  )
}
export default App
