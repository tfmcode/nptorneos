import React from "react";
import {
  HeroCarousel,
  NewSections,
  /*   SocialMedia,
   */ LogosCloud,
} from "./components";

const Home: React.FC = () => {
  return (
    <>
      <HeroCarousel />
      <NewSections />
      {/*       <SocialMedia />
       */}{" "}
      <LogosCloud />
    </>
  );
};

export default Home;
