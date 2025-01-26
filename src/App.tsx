import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EPublicRoutes } from "./models";
import { Layout } from "./components/layouts";
import { Home, About, Contact, Concents, Tournaments, System } from "./pages";
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
            </Route>
            <Route path={EPublicRoutes.SISTEMA} element={<System />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
