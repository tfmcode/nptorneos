import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EPrivateRoutes, EPublicRoutes } from "./models";
import PrivateRoute from "./routes/PrivateRoute";
import { Layout } from "./layouts";
import {
  Home,
  About,
  Contact,
  Concents,
  Tournaments,
  PageNotFound,
  Login,
  RecPassword,
} from "./pages";
import "./App.css";
import System from "./pages/private/System";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path={EPublicRoutes.HOME} element={<Home />} />
            <Route path={EPublicRoutes.ABOUT} element={<About />} />
            <Route path={EPublicRoutes.CONTACT} element={<Contact />} />
            <Route path={EPublicRoutes.CONCENTS} element={<Concents />} />
            <Route path={EPublicRoutes.TOURNAMENTS} element={<Tournaments />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
          <Route path={EPublicRoutes.LOGIN} element={<Login />} />
          <Route path={EPublicRoutes.REC_PASSWORD} element={<RecPassword />} />
          <Route element={<PrivateRoute />}>
            <Route path={EPrivateRoutes.SISTEMA} element={<System />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
