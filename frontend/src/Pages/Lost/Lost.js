import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './Lost.css';
import { AuthContext } from '../../Firebase/Authentication/AuthContext/AuthContext';
import LocationInput from '../../Components/LocationInput/LocationInput';
import { auth } from '../../Firebase/firebase-config';

function Lost() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { user, isLoading } = useContext(AuthContext);
  const [userId, setUserId] = useState('');  // State to store the user._id

  // Fetch user details using email and set the user._id when the component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`${process.env.REACT_APP_FETCH_USER}?email=${user.email}`);
          const data = await response.json();
          
          if (data && data._id) {
            setUserId(data._id); // Assuming the response contains the _id
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    if (user?.email) {
      fetchUserDetails();
    }
  }, [user]);

  // Handle image change (for live preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));  // Create preview for the selected image
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('User details not found!');
      return;
    }

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('name', name);
    formData.append('userid', userId);  // Use user._id from the fetched user details
    formData.append('location', JSON.stringify(location));
    formData.append('description', description);
    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]); // Append image file to FormData
    }

    try {
      // Send POST request to backend
      const response = await axios.post(`${process.env.REACT_APP_POST_LOSTITEMS}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      // Handle successful form submission
      console.log('Item Submitted:', response.data);
      alert('Lost item reported successfully!');

      // Reset all fields
      setName('');
      setLocation('');
      setDescription('');
      setImage(null); // Clear the image preview
      e.target.reset(); // Reset file input
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,  // This will show the backend error
        status: error.response?.status
      });
      alert('Failed to report lost item.');
    }
  };

  return (
    <div className="lost-container">
      <h2>Report Lost Item</h2>

      {/* Image Preview */}
      {image && <img src={image} alt="preview" className="image-preview" />}

      <form onSubmit={handleSubmit} className="lost-form">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Use the LocationInput Component */}
        <LocationInput setLocation={setLocation} />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label htmlFor="image">Upload Image:</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}


export default Lost;
