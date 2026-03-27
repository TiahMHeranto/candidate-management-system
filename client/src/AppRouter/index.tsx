// AppRouter.tsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Login } from "../Pages/AuthenticationPage";
import { Candidates } from "../Pages/Candidates";
import { CandidateDetail } from "../Pages/CandidateDetail";

// Protection des routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/candidates"
          element={
            <PrivateRoute>
              <Candidates />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <PrivateRoute>
              <CandidateDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;