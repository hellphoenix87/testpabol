import { Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from "./redux/store/store";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserContext } from "./components/UserContext";
import { Toast } from "./components/Toast";
import { lazy } from "./utils/LazyLoadingPage";
const FrontPage = lazy(() => import("./pages/frontpage"));
const NotFound = lazy(() => import("./pages/notfound"));
const Create = lazy(() => import("./pages/create"));
const Contact = lazy(() => import("./pages/contact"));
const AboutUs = lazy(() => import("./pages/about"));
const Video = lazy(() => import("./pages/video/Video"));
const Legal = lazy(() => import("./pages/legal"));
const Netzdg = lazy(() => import("./pages/netzdg"));
const Search = lazy(() => import("./pages/search"));
const Channel = lazy(() => import("./pages/channel"));
const Account = lazy(() => import("./pages/account"));
const Feature = lazy(() => import("./pages/feature"));
const Creations = lazy(() => import("./pages/creations"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/termsOfUse"));
const Imprint = lazy(() => import("./pages/imprint"));
import { ProgressBarProvider } from "@app/pages/create/context/ProgressBarContext";

const App = () => (
  <Provider store={store}>
    <UserContext>
      <Toast />
      <Router>
        <Suspense fallback={<div className=""></div>}>
          <Routes>
            <Route path="/" element={<FrontPage />} />
            <Route
              path="/create/:cid?"
              element={
                <ProtectedRoute redirectPath="/feature" creatorRequired>
                  <ProgressBarProvider>
                    <Create />
                  </ProgressBarProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/video/:id" element={<Video />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/netzdg" element={<Netzdg />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/termsofuse" element={<TermsOfUse />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/channel/:userId" element={<Channel />} />
            <Route
              path="/account/:tabId?"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creations"
              element={
                <ProtectedRoute redirectPath="/feature" creatorRequired>
                  <Creations />
                </ProtectedRoute>
              }
            />
            <Route path="/feature" element={<Feature />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </UserContext>
  </Provider>
);

export default App;
