import React, { useContext, useEffect, useState } from 'react';
import './Dashboard.css';
import UpdateLocation from '../../Components/UpdateLocataion/UpdateLocation';
import { AuthContext } from '../../Firebase/Authentication/AuthContext/AuthContext';
import ManageItem from '../../Components/ManageItem/ManageItem';

function Dashboard() {
  const [location, setLocation] = useState(false);
  const [manageItems, setManageItems] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { user, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (user?.email) {
      fetch(`${process.env.REACT_APP_FETCH_USER}?email=${user.email}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch user details');
          }
          return response.json();
        })
        .then((data) => {
          setUserDetails(data);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [user]);

  if (isLoading || !userDetails) {
    return <div>Loading...</div>;
  }

  const handleLocationClick = () => {
    setManageItems(false);
    setLocation((prevLocation) => !prevLocation);
  };

  const handleManageItemsClick = () => {
    setLocation(false);
    setManageItems((prevManageItems) => !prevManageItems);
  };

  return (
    <div className="dashboardPage">
      <div className="container-fluid">
        <div className="dashLeft">
          <h1>{userDetails?.username || 'N/A'}</h1>
          <h5>{user?.email || 'N/A'}</h5>
          <h5>{userDetails?.location?.address || 'No Address Available'}</h5>
          <button onClick={handleLocationClick}>
            {location ? 'Hide Location' : 'Update Location'}
          </button>
          <button onClick={handleManageItemsClick}>
            {manageItems ? 'Hide Manage Items' : 'Manage Items'}
          </button>
        </div>
        <div className="dashRight">
          {location && <UpdateLocation userId={userDetails._id} />}
          {manageItems && <ManageItem userId={userDetails._id} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;