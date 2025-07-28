import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProduct from './components/RegisterProduct';
import ArticleList from './components/ArticleList';
import ArticleForm from './components/ArticleForm';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <div>
      <RegisterProduct/>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArticleForm />} />
        <Route path="/articles" element={<ArticleList />} />
      </Routes>
    </BrowserRouter>
    </div>
    
  );


}

export default App;
