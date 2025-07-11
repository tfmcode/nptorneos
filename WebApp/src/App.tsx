import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EPrivateRoutes, EPublicRoutes } from "./models";
import PrivateRoute from "./routes/PrivateRoute";
import { Layout } from "./layouts";
import {
  Home,
  About,
  Contact,
  Concents,
  PageNotFound,
  Login,
  RecPassword,
  TorneoPublic,
  System,
} from "./pages";
import "./App.css";

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
            <Route
              path={EPublicRoutes.TORNEO_PUBLIC}
              element={<TorneoPublic />}
            />
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
