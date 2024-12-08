import { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from "./redux/store/store";
import { UserContext } from "./components/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const FrontPage = lazy(() => import("./pages/FrontPage"));
const ModerationPage = lazy(() => import("./pages/ModerationPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const User = lazy(() => import("./pages/User"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Video = lazy(() => import("./pages/Video"));

const App = () => (
  <Provider store={store}>
    <UserContext>
      <Router>
        <Suspense fallback={<div></div>}>
          <Routes>
            <Route path="/" element={<FrontPage />} />
            <Route
              path="/moderation"
              element={
                <ProtectedRoute>
                  <ModerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:uid"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video/:id"
              element={
                <ProtectedRoute>
                  <Video />
                </ProtectedRoute>
              }
            />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </UserContext>
  </Provider>
);

export default App;
