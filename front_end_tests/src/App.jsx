import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./HomePage/MainLayout";
import HomePage from "./HomePage/HomePage";

import Login from "./Login/Login";
import Register from "./Login/Register";
import ChangePassword from "./Login/ChangePassword";

import LevelSelector from "./pages/LevelSlector";
import SectionSelector from "./pages/SectionSelector";
import PartSelector from "./pages/PartSelector";
import ModelSelector from "./pages/ModelSelector";
import ExercisePage from "./pages/ExercisePage";

import CreateGroup from "./Groups/CreateGroup";
import GroupScores from "./Groups/GroupScores";

import NotFoundPage from "./pages/NotFoundPage";

import PasswordResetRequest from "./Login/PasswordRessetRequest";
import PasswordResetConfirm from "./Login/PasswordResetConfirm";

import { GoogleOAuthProvider } from '@react-oauth/google';
import UserProfile from "./HomePage/Userprofile";
import AverageScores from "./HomePage/AverageScores";
import { Contact } from "./HomePage/Contact";

// Componente que protege rutas solo si hay token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId="430380050745-9gd6tn0tkdme2538u9ck6o5ef0ke07ie.apps.googleusercontent.com">
      <Router>
        <Routes>
          {/* Todas las rutas envueltas en MainLayout para header/footer */}
          <Route element={<MainLayout />}>
            {/* Rutas públicas (NO requieren login) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/level" element={<LevelSelector />} />
            <Route path="/:level" element={<SectionSelector />} />
            <Route path="/:level/:section" element={<PartSelector />} />
            <Route path="/:level/:section/part/:part" element={<ModelSelector />} />
            <Route path="/:level/:section/part/:part/model/:model" element={<ExercisePage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/password-reset" element={<PasswordResetRequest />} />
            <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my_scores" element={<AverageScores />} />

            <Route path="/contact" element={<Contact />} />

            {/* Rutas privadas (REQUIEREN login) */}
            <Route
              path="/create-group"
              element={
                <PrivateRoute>
                  <CreateGroup />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:group_id/scores"
              element={
                <PrivateRoute>
                  <GroupScores />
                </PrivateRoute>
              }
            />
            

            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;