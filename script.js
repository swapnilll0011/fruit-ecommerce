// Global variables
let editingFruitId = null;

// Modal-related elements
const fruitModal = document.getElementById('fruitModal');
const modalTitle = document.getElementById('modalTitle');
const fruitForm = document.getElementById('fruitForm');
const closeModal = document.querySelector('.close');
const openModalButton = document.getElementById('openAddFruitModal');
const existingImagePath = document.getElementById('existingImagePath');

// Open the modal
openModalButton.addEventListener('click', () => {
  editingFruitId = null;
  modalTitle.textContent = 'Add a New Fruit';
  document.getElementById('submitButton').textContent = 'Add Fruit';
  fruitForm.reset();
  existingImagePath.textContent = '';
  fruitModal.style.display = 'block';
  document.getElementById('fruitName').focus(); // Focus on the first input
});

// Close the modal
closeModal.addEventListener('click', () => {
  fruitModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === fruitModal) {
    fruitModal.style.display = 'none';
  }
});

// Centralized function for error handling
function handleError(error, message) {
  console.error(`${message}:`, error);
  alert(message);
}

// Fetch and display all fruits
async function fetchFruits() {
  try {
    const response = await fetch('http://localhost:3000/admin/fruits');
    if (!response.ok) throw new Error('Failed to fetch fruits');
    const fruits = await response.json();
    displayFruits(fruits);
  } catch (error) {
    handleError(error, 'Error fetching fruits');
  }
}

// Display fruits
function displayFruits(fruits) {
  const fruitsList = document.getElementById('fruits');
  fruitsList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  fruits.forEach((fruit) => {
    const fruitCard = document.createElement('li');
    fruitCard.innerHTML = `
      <img src="http://localhost:3000${fruit.imageURL}" alt="${fruit.name}" />
      <h3>${fruit.name}</h3>
      <p><strong>Price:</strong> Rs ${fruit.price.toFixed(2)}</p>
      <p><strong>Description:</strong> ${fruit.description}</p>
      <p><strong>Quantity:</strong> ${fruit.quantity} Kgs</p>
      <button onclick="deleteFruit('${fruit._id}')">Delete</button>
      <button onclick="editFruit('${fruit._id}', '${fruit.name}', ${fruit.price}, '${fruit.description}', '${fruit.quantity}', '${fruit.imageURL}')">Edit</button>
    `;
    fragment.appendChild(fruitCard);
  });

  fruitsList.appendChild(fragment);
}

// Add or update a fruit
fruitForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(fruitForm);
  formData.append('quantity', document.getElementById('fruitQuantity').value);

  const url = editingFruitId
    ? `http://localhost:3000/admin/update-fruit/${editingFruitId}`
    : 'http://localhost:3000/admin/add-fruit';

  const method = editingFruitId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, { method, body: formData });
    if (!response.ok) throw new Error('Failed to save fruit');

    alert(editingFruitId ? 'Fruit updated successfully' : 'Fruit added successfully');
    fetchFruits();
    fruitModal.style.display = 'none';
  } catch (error) {
    handleError(error, 'Failed to save fruit. Please try again.');
  }
});

// Edit a fruit
function editFruit(id, name, price, description, quantity, imageURL) {
  editingFruitId = id;
  document.getElementById('fruitName').value = name;
  document.getElementById('fruitPrice').value = price;
  document.getElementById('fruitDescription').value = description;
  document.getElementById('fruitQuantity').value = quantity;
  document.getElementById('fruitImageFile').value = '';
  existingImagePath.textContent = `Current Image: ${imageURL}`;
  modalTitle.textContent = 'Edit Fruit';
  document.getElementById('submitButton').textContent = 'Update Fruit';
  fruitModal.style.display = 'block';
}

// Delete a fruit
async function deleteFruit(id) {
  if (!confirm('Are you sure you want to delete this fruit?')) return;

  try {
    const response = await fetch(`http://localhost:3000/admin/delete-fruit/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete fruit');

    alert('Fruit deleted successfully');
    fetchFruits();
  } catch (error) {
    handleError(error, 'Failed to delete fruit. Please try again.');
  }
}
//filetr or search fruits
function filterFruits() {
  const searchValue = document.getElementById("fruitSearch").value.toLowerCase();
  const fruitCards = document.querySelectorAll("#fruits li");

  fruitCards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(searchValue) ? "" : "none";
  });
}

// Sidebar Toggle Logic
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('main-content');
const feedbackContainer = document.getElementById('feedback-container'); // Ensure feedback shifts


sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shift');
  feedbackContainer.classList.toggle('shift'); // Shift feedback when sidebar opens

});

// Function to show a specific section and hide others
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach((section) => {
    section.style.display = 'none';
  });

  const selectedSection = document.getElementById(sectionId);
  selectedSection.style.display = 'block';
}

// Set "Available Fruits" as the default visible section
document.addEventListener('DOMContentLoaded', () => {
  showSection('fruit-container');
  fetchFruits();
  fetchOrders();
  fetchUsers();
  fetchFeedback();
});

// Fetch and display orders
// Fetch and display orders
async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:3000/admin/orders');

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }

    const orders = await response.json();
    console.log("Fetched orders:", orders); // Debugging step

    if (Array.isArray(orders) && orders.length > 0) {
      populateOrderTable(orders);
    } else {
      console.warn("No orders found.");
      populateOrderTable([]); // Clears the table if no orders are found
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    handleError(error, 'Failed to fetch orders');
  }
}

// Populate the order table in the admin panel
// Populate the order table in the admin panel
function populateOrderTable(orders) {
  console.log("Orders received:", orders); // Debugging step

  const tableBody = document.getElementById('orderTableBodyOrders');
  tableBody.innerHTML = '';

  if (!Array.isArray(orders) || orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8">No orders found.</td></tr>';
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement('tr');
    row.setAttribute("id", `order-${order._id}`); // Unique ID for easy updates

    // Get user name if available
    const userName = order.userId && order.userId.name ? order.userId.name : 'Unknown';

    // Format ordered items
    const orderedItems = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');

    // Status button (Only show for pending orders)
    const statusButton =
      order.status === "Pending"
        ? `<button class="status-btn deliver" onclick="updateOrderStatus('${order._id}')">Mark as Delivered</button>`
        : "Success"; // If already delivered, just show "Success"

    row.innerHTML = `
      <td>${order._id}</td>
      <td>${userName}</td>
      <td>${orderedItems}</td>
     <td>${order.userId ? `${order.address}, ${order.phone}` : 'N/A'}</td>
      <td>Rs ${order.totalAmount.toFixed(2)}</td>
      <td id="status-${order._id}">${order.status}</td>
      <td>${order.date ? new Date(order.date).toLocaleString() : 'N/A'}</td>
      <td id="status-btn-${order._id}">${statusButton}</td>
    `;

    tableBody.appendChild(row);
  });
}

// Function to update order status
// Function to update order status
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("status-btn") && event.target.classList.contains("deliver")) {
    const button = event.target;
    const orderId = button.closest("tr").getAttribute("id").split('-')[1]; // Get the order ID

    // Send a PUT request to update the order status
    fetch(`http://localhost:3000/admin/update-order-status/${orderId}`, {
        method: "PUT",
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update the status to "Success"
          const row = button.closest("tr");
          const statusCell = row.querySelector(`#status-${orderId}`);
          if (statusCell) {
            statusCell.innerText = "Success"; // Update status text
          }

          // Remove the button after successful update
          button.remove();
        } else {
          alert("Failed to update order status.");
        }
      })
      .catch(error => {
        console.error("Error updating order:", error);
        alert("An error occurred while updating the order.");
      });
  }
});





// Call fetchOrders when the page loads
document.addEventListener("DOMContentLoaded", fetchOrders);


// Fetch users and render in the table
async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/users");
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const users = await response.json();

    // Render users in a table
    const userTable = document.getElementById("userTableBody"); // Ensure you have a <tbody> with this ID
    userTable.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
      const row = `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${user.address}</td>
          <td>${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</td>
          <td><button onclick="deleteUser('${user._id}')">Delete</button></td>
        </tr>
      `;
      userTable.innerHTML += row;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Delete a user
async function deleteUser(id) {
  console.log("Attempting to delete user with ID:", id); // Debugging log

  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const response = await fetch(`http://localhost:3000/admin/delete-users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Delete response:", response); // Debugging log

    if (!response.ok) throw new Error("Failed to delete user");

    const result = await response.json();
    console.log("Delete result:", result); // Debugging log

    alert("User deleted successfully");
    fetchUsers(); // Refresh the user list after deletion
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user. Please try again.");
  }
}


// Call fetchUsers to load data when the page loads
window.onload = fetchUsers;
function filterUsers() {
  const searchValue = document.getElementById("UserSearch").value.toLowerCase();
  const tableRows = document.querySelectorAll("#userTableBody tr");

  tableRows.forEach((row) => {
    const rowText = row.innerText.toLowerCase();
    row.style.display = rowText.includes(searchValue) ? "" : "none";
  });
}
// Fetch and display all feedback
async function fetchFeedback() {
  try {
    const response = await fetch('http://localhost:3000/admin/feedbacks');
    if (!response.ok) throw new Error('Failed to fetch feedback');
    
    const feedbacks = await response.json();
    displayFeedback(feedbacks);
  } catch (error) {
    handleError(error, 'Error fetching feedback');
  }
}

// Display feedback in the admin panel
function displayFeedback(feedbacks) {
  const feedbackTableBody = document.getElementById('feedbackTableBody');
  feedbackTableBody.innerHTML = ''; // Clear existing content

  if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
    feedbackTableBody.innerHTML = '<tr><td colspan="6">No feedback available.</td></tr>';
    return;
  }

  feedbacks.forEach((feedback) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${feedback.name}</td>
      <td>${feedback.email}</td>
      <td>${feedback.phone}</td>
      <td>${feedback.rating}</td>
      <td>${feedback.comments || 'No comments'}</td>
      <td>${new Date(feedback.createdAt).toLocaleString()}</td>
      <td>
        <button onclick="deleteFeedback('${feedback._id}')">Delete</button>
      </td>
    `;
    feedbackTableBody.appendChild(row);
  });
}

// Delete a feedback entry
async function deleteFeedback(id) {
  if (!confirm('Are you sure you want to delete this feedback?')) return;

  try {
    const response = await fetch(`http://localhost:3000/admin/delete-feedback/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete feedback');

    alert('Feedback deleted successfully');
    fetchFeedback();
  } catch (error) {
    handleError(error, 'Failed to delete feedback');
  }
}

// Call fetchFeedback to load data when the page loads
document.addEventListener('DOMContentLoaded', fetchFeedback);


const socket = new WebSocket("ws://localhost:3000"); // Adjust URL if needed

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "new_order") {
    console.log("New order received, updating orders...");
    fetchOrders(); // Refresh orders list
  }
});
const ws = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server

// When the connection is open
ws.onopen = () => {
  console.log('Connected to WebSocket');
  ws.send('Hello, Server!');
};

// When a message is received from the server
ws.onmessage = (event) => {
  console.log('Message from server:', event.data);
};

// When the connection closes
ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
