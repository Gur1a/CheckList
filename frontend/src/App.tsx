import React, {useEffect, useState}from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routers/AppRoutes';
import 'react-toastify/dist/ReactToastify.css';
import './styles/loading.css';

const App: React.FC = () => {
  return (
    <Router>
       <AuthProvider>
        <TaskProvider>
          <div className="App" style={{ height: '100vh' }}>
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
        </div>
        </TaskProvider>
      </AuthProvider>
    </Router>
       
  );
};

export default App;