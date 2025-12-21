import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignIn } from './pages/signIn/signIn';
import { SignUp } from './pages/signup/signUp';
import {Routes,Route,} from "react-router-dom"
import ForgetPassword from './pages/forgetPassword/forgetPassword';
import { PasswordReset } from './pages/passwordReset/passwordReset';
import Landing from './pages/landing/landing';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/auth/login' element={<SignIn/>}/>
        <Route path='/auth/register' element={<SignUp/>}/>
        <Route path='/auth/sendResetOtp' element={<ForgetPassword/>}/>
        <Route path='/auth/passwordReset' element={<PasswordReset/>}/>
      </Routes>
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
