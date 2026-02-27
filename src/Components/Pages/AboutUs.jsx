import axios from "axios";
import { ArrowBigLeftIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const Navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [aboutData, setAboutData] = useState("");
  // console.log(aboutData);
  useEffect(() => {
    axios
      .get("https://techimmense.in/airhopi/webservice/get_user_page")
      .then((res, req) => {
        setAboutData(res.data.result);
      });
  }, []);

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div>
     
      <div className="bg-gray-50 min-h-screen">
        {/* TOP BUTTONS */}
        <div className="bg-white border-b">
          <div className="max-w-2xl mx-auto px-4 py-4 flex justify-center gap-3">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 rounded-lg border ${
                activeTab === "about" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              About Us
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-4 py-2 rounded-lg border ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Privacy Policy
            </button>

            <button
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-2 rounded-lg border ${
                activeTab === "terms" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Terms & Conditions
            </button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="max-w-5xl mx-auto px-4 py-8 bg-white mt-4 rounded-xl shadow">
          {activeTab === "about" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">About Us</h2>
              <p className="text-gray-600">
                {/* {aboutData.about_us} */}
                {stripHtml(aboutData?.about_us)}
              </p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Privacy Policy</h2>
              <p className="text-gray-600">{stripHtml(aboutData?.privacy)}</p>
            </div>
          )}

          {activeTab === "terms" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">
                Terms & Conditions
              </h2>
              <p className="text-gray-600">{stripHtml(aboutData?.term_sp)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
