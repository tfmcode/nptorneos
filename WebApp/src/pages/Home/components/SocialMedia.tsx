import React from "react";

const SocialMedia: React.FC = () => {
  const socialPlatforms = [
    {
      name: "Facebook",
      icon: "fab fa-facebook-f",
      iframeSrc:
        "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fliganptorneos%2Fposts%2Fpfbid02WzvrrZApDQwn5igxKBm113Kh18ipd58jckmwHcg33qn3dzzC9jGhqVopBGwnzSHil&show_text=true&width=500",
      description: "NP Torneos en Facebook",
    },
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      iframeSrc: "https://www.instagram.com/p/C7ZNOheOsFl/embed",
      description: "NP Torneos en Instagram",
    },
    {
      name: "YouTube",
      icon: "fab fa-youtube",
      iframeSrc: "https://www.youtube.com/embed/hsGT-JODhuY",
      description: "NP Torneos en YouTube",
    },
  ];

  return (
    <div className="bg-gray-100 py-16 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 relative">
        Nuestras Redes
        <span className="block w-16 h-1 bg-yellow-600 mx-auto mt-2"></span>
      </h2>

      <div
        className=""
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {socialPlatforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-white rounded-xl shadow-lg hover:scale-105 transition-transform overflow-hidden w-full sm:w-[45%] max-w-xs"
          >
            <div className="p-4 text-2xl text-gray-700">
              <i className={platform.icon}></i>
            </div>
            <iframe
              src={platform.iframeSrc}
              width="100%"
              height="400"
              className="border-0"
              style={{ overflow: "hidden" }}
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            ></iframe>
            <div className="p-4 text-gray-700">
              <h5 className="text-lg font-bold">{platform.description}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SocialMedia;
