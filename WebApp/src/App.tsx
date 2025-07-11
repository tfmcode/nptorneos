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
  CentroEntrenamiento,
  FutbolNP,
  NuevoParadigma,
} from "./pages";
import "./App.css";
import System from "./pages/private/System";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path={EPublicRoutes.HOME} element={<Home />} />
            <Route path={EPublicRoutes.ABOUT} element={<About />} />
            <Route path={EPublicRoutes.CONTACT} element={<Contact />} />
            <Route path={EPublicRoutes.CONCENTS} element={<Concents />} />
            <Route path={EPublicRoutes.TOURNAMENTS} element={<Tournaments />} />
            <Route path={EPublicRoutes.FUTBOL_NP} element={<FutbolNP />} />
            <Route
              path={EPublicRoutes.NUEVO_PARADIGMA}
              element={<NuevoParadigma />}
            />

            <Route path="*" element={<PageNotFound />} />
            <Route
              path={EPublicRoutes.CENTRO_ENTRENAMIENTO}
              element={<CentroEntrenamiento />}
            />
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
