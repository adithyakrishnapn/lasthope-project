import React, { useEffect, useState } from "react";
import styles from "./ManageItem.module.css";

function ManageItem({ userId }) {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [itemDetails, setItemDetails] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lost?userId=${userId}`)
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched items:", data); // Log the items fetched from the API
        setItems(data); // Update state with fetched items
      })
      .catch((err) => console.error("Error fetching items:", err));
  }, [userId]);
  
  const handleInputChange = (e) => setItemDetails(e.target.value);

  const handleEditToggle = (itemId, currentDetails) => {
    setIsEditing(itemId);
    setItemDetails(currentDetails);
  };

  const handleUpdate = (itemId) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: itemDetails }), // Change 'details' to 'description'
    })
      .then((res) => res.json())
      .then(() => {
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, description: itemDetails } : item
          )
        );
        setIsEditing(null);
      })
      .catch((err) => console.error("Error updating item:", err));
  };
  

  const handleDelete = (itemId) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/${itemId}`, {
      method: "DELETE",
    })
      .then(() => setItems((prev) => prev.filter((item) => item._id !== itemId)))
      .catch((err) => console.error("Error deleting item:", err));
  };

  const handleMarkAsFound = (itemId) => {
    console.log(`Initiating request to mark item as found. Item ID: ${itemId}`);
  
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/${itemId}/mark-as-found`, {
      method: "PUT",
    })
      .then((res) => {
        console.log(`Response received for marking item as found. Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`Response data:`, data);
  
        if (data.message === "Item marked as found") {
          console.log(`Updating UI for item ID: ${itemId}`);
          setItems((prev) =>
            prev.map((item) =>
              item._id === itemId ? { ...item, status: "found" } : item
            )
          );
        } else {
          console.warn(`Failed to mark item as found: ${data.error}`);
        }
      })
      .catch((err) => {
        console.error("Error marking item as found:", err);
      });
  };
  
  

  return (
    <div className={styles.manageItem}>
      <h2>Your Lost Items</h2>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li key={item._id} className={styles.item}>
              <h3>{item.name}</h3>
              <p>
                {isEditing === item._id ? (
                  <>
                    <input
                      type="text"
                      value={itemDetails}
                      onChange={handleInputChange}
                      placeholder="Update details"
                    />
                    <button onClick={() => handleUpdate(item._id)}>Save</button>
                  </>
                ) : (
                  item.description
                )}
              </p>
              <div className={styles.itemActions}>
                {isEditing !== item._id && (
                  <button
                    onClick={() =>
                      handleEditToggle(item._id, item.description)
                    }
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleMarkAsFound(item._id)}
                  className={styles.foundButton}
                >
                  Mark as Found
                </button>
              </div>
              <p>
                Status: <strong>{item.found? "Found": "lost"}</strong>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageItem;
