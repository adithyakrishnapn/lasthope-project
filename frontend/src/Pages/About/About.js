import React from "react";
import "./About.css"

const About = () => {
  return (
    <div className="about-page">
      <section className="about-content">
        <p>
          Welcome to <strong>LastHope</strong> — your ultimate platform to reconnect with lost and found items. 
          Our mission is to provide a bridge between owners and their lost belongings through an easy-to-use and 
          efficient platform. Whether it’s a cherished memory or a vital document, we strive to bring relief to 
          those in need.
        </p>
        <p>
          With advanced item categorization, real-time notifications, and a supportive community, LastHope ensures 
          your lost items have the best chance of being returned to you. Together, let’s create a world where nothing 
          truly valuable is ever lost.
        </p>
      </section>
      <section className="about-features">
        <h2>Why Choose LastHope?</h2>
        <ul>
          <li>
            <strong>Quick Reporting:</strong> Seamlessly report lost items with detailed descriptions and images.
          </li>
          <li>
            <strong>Smart Matching:</strong> Match lost items with found items nearby using location-based technology.
          </li>
          <li>
            <strong>Real-Time Notifications:</strong> Stay updated whenever an item is found or reported near you.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default About;
