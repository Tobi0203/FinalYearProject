import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignIn } from './pages/signIn/signIn';
import { SignUp } from './pages/signup/signUp';
import { BrowserRouter, Routes, Route, } from "react-router-dom"
import ForgetPassword from './pages/forgetPassword/forgetPassword';
import { PasswordReset } from './pages/passwordReset/passwordReset';
import Landing from './pages/landing/landing';
import PublicRoute from './routes/publicRoute';
import PrivateRoute from './routes/privateRoute';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
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
          <Route path='/' element={<Landing />} />
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
