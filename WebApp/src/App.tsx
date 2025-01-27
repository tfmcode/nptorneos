import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EPublicRoutes } from "./models";
import { Layout } from "./components/layouts";
import {
  Home,
  About,
  Contact,
  Concents,
  Tournaments,
  System,
  PageNotFound,
  Login,
  RecPassword,
} from "./pages";
import "./App.css";

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path={EPublicRoutes.HOME} element={<Home />} />
              <Route path={EPublicRoutes.ABOUT} element={<About />} />
              <Route path={EPublicRoutes.CONTACT} element={<Contact />} />
              <Route path={EPublicRoutes.CONCENTS} element={<Concents />} />
              <Route
                path={EPublicRoutes.TOURNAMENTS}
                element={<Tournaments />}
              />
              <Route path="*" element={<PageNotFound />} />
            </Route>
            <Route path={EPublicRoutes.SISTEMA} element={<System />} />
            <Route path={EPublicRoutes.LOGIN} element={<Login />} />
            <Route
              path={EPublicRoutes.REC_PASSWORD}
              element={<RecPassword />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
