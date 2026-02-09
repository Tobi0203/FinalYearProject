import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, } from "react-router-dom"
import { SignIn } from './Pages/SignIn/SignIn';
import { SignUp } from './Pages/Signup/SignUp';
import ForgetPassword from './Pages/ForgetPassword/ForgetPassword';
import { PasswordReset } from './Pages/PasswordReset/PasswordReset';
import Landing from './Pages/Landing/Landing';
import PublicRoute from './Routes/PublicRoute';
import PrivateRoute from './Routes/PrivateRoute';
import Home from './Pages/Home/Home';
import Profile from './Pages/Profile/Profile';
import Saved from './Pages/Saved/Saved';
import Liked from './Pages/Liked/Liked';
import Messages from "./Pages/Messages/Messages";
import SinglePost from "./Pages/Post/SinglePost";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <PublicRoute><Landing /></PublicRoute>} />
          <Route path='/auth/login' element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>} />
          <Route path='/auth/register' element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>} />
          <Route path='/auth/sendResetOtp' element={
            <PublicRoute>
              <ForgetPassword />
            </PublicRoute>} />
          <Route path='/auth/passwordReset' element={
            <PublicRoute>
              <PasswordReset />
            </PublicRoute>} />
          <Route path='/home' element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>} />
          <Route path='/profile/:userId' element={
            <PrivateRoute>
              <Profile/>
            </PrivateRoute>
          }/>
          <Route path='/saved' element={
            <PrivateRoute>
              <Saved/>
            </PrivateRoute>
          }/>
          <Route path='/Liked' element={
            <PrivateRoute>
              <Liked/>
            </PrivateRoute>
          }/>
          <Route path='/messages' element={
            <PrivateRoute>
              <Messages/>
            </PrivateRoute>
          }/>
          <Route path="/post/:postId" element={<SinglePost />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

export default App;
