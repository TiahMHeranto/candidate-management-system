// AppRouter.tsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Login } from "../Pages/AuthenticationPage";
import { Candidates } from "../Pages/Candidates";
import { CandidateDetail } from "../Pages/CandidateDetail";
import { CandidateCreate } from "../Pages/CandidateCreate";
import { CandidateEdit } from "../Pages/CandidateEdit";

// Protection des routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Candidates />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidates/create"
          element={
            <PrivateRoute>
              <CandidateCreate />
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
        <Route
          path="/candidates/:id/edit"
          element={
            <PrivateRoute>
              <CandidateEdit />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;