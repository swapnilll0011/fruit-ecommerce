// Global variables
let editingFruitId = null;
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Initialize cart from local storage

// Modal-related elements
const fruitModal = document.getElementById('fruitModal');
const modalTitle = document.getElementById('modalTitle');
const fruitForm = document.getElementById('fruitForm');
const closeModal = document.querySelector('.close');
const openModalButton = document.getElementById('openAddFruitModal');
const existingImagePath = document.getElementById('existingImagePath');

// Close modal on outside click
window.addEventListener('click', (event) => {
  if (event.target === fruitModal) {
    fruitModal.style.display = 'none';
  }
});

// Fetch and display all fruits
async function fetchFruits() {
  try {
    const response = await fetch('http://localhost:3000/admin/fruits');
    if (!response.ok) throw new Error('Failed to fetch fruits');
    const fruits = await response.json();
    displayFruits(fruits);
  } catch (error) {
    console.error('Error fetching fruits:', error);
  }
}

// Display fruits
function displayFruits(fruits) {
  const fruitsList = document.getElementById('fruits');
  fruitsList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  fruits.forEach((fruit, index) => {
    const fruitClass = `fruit-list-${(index % 5) + 1}`;
    const fruitCard = document.createElement('li');
    fruitCard.classList.add('fruit-item', fruitClass); // ✅ Corrected class

    fruitCard.innerHTML = `
      <img src="http://localhost:3000${fruit.imageURL}" alt="${fruit.name}" />
      <h3>${fruit.name}</h3> 
      <p class="fruit-quantity"><strong></strong> ${fruit.quantity} Kgs</p>
      <p><strong></strong> Rs ${fruit.price.toFixed(2)}</p>
      <button class="add-to-cart" onclick="addToCart('${fruit.name}', ${fruit.price}, 'http://localhost:3000${fruit.imageURL}')">
        <img src="images/cart-icon.png" alt="cart-icon" style="width: 24px; height: 24px;">
      </button>
    `;

    

    fragment.appendChild(fruitCard);
  });

  fruitsList.appendChild(fragment);
}

function addToCart(name, price, imageURL) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
      existingItem.quantity += 1;
  } else {
      cart.push({ name, price, quantity: 1, image: imageURL }); // Store the image URL
  }

  localStorage.setItem('cart', JSON.stringify(cart)); // Save cart in localStorage
  displayCart(); // Update cart UI
  updateCartBadge(); // Update the cart badge
  showToastMessage("Item added to cart!"); // Show toast message
}








// Function to show a toast message
function showToastMessage(message) {
  const toast = document.getElementById('toast-message'); // Get the toast element
  if (!toast) {
      console.error("Toast element not found!");
      return;
  }

  toast.textContent = message; // Set the message
  toast.classList.add('toast-show'); // Show the toast

  // Hide the toast after 3 seconds
  setTimeout(() => {
      toast.classList.remove('toast-show');
  }, 3000);
}





// Function to update the cart badge
function updateCartBadge() {
  let cartBadge = document.getElementById("cart-badge");

  // Calculate total quantity of items in cart
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Show the badge only if cart has items
  if (totalQuantity > 0) {
    cartBadge.innerText = totalQuantity;
    cartBadge.classList.remove("hidden"); // Show the badge
  } else {
    cartBadge.classList.add("hidden"); // Hide the badge when cart is empty
  }
}



// Function to remove fruit from cart
function removeFromCart(index) {
  cart.splice(index, 1); // Remove item from cart
  localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
  displayCart(); // Update cart UI
  updateCartBadge(); // ✅ Update the cart badge
}




// Function to display cart items and update cart badge
function displayCart() {
  const cartList = document.getElementById('cart-items'); // Get cart list element
  const cartBadge = document.getElementById('cart-badge'); // Get cart badge element

  if (!cartList) {
      console.warn("Cart list not found on this page. Skipping cart display.");
      return; // Stop execution if cart-items is not found
  }

  cartList.innerHTML = ''; // Clear existing cart items

  if (cart.length === 0) {
      cartList.innerHTML = '<p>Your cart is empty.</p>';
      if (cartBadge) cartBadge.classList.add('hidden'); // Hide badge if cart is empty
      return;
  }

  let totalItems = 0; // Track total items for badge count

  cart.forEach((item, index) => {
      totalItems += item.quantity; // Count total quantity of items

      const cartItem = document.createElement('li');
      cartItem.innerHTML = `
          <div class="cart-item">
              <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src=''">
              <div>
                  <span>${item.name} - Rs ${item.price} x ${item.quantity}</span>
              </div>
              <button onclick="removeFromCart(${index})">❌</button>
          </div>
      `;
      cartList.appendChild(cartItem);
  });

  // ✅ Update the cart badge
  if (cartBadge) {
      cartBadge.textContent = totalItems; // Set total items count
      cartBadge.classList.remove('hidden'); // Show badge
  }
}





// Function to show a specific section and hide others
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Set "Available Fruits" as the default visible section and load cart
document.addEventListener('DOMContentLoaded', () => {
  showSection('fruit-container'); // Show the default section
  fetchFruits(); // Load products from the admin panel
  displayCart(); // Load and display the cart
  updateCartBadge(); // ✅ Ensure the cart badge updates when the page loads
});



        // Load the slider dynamically
  function updateSlider() {
  const slider = document.getElementById("slider-container");
  if (!slider) {
    console.warn("Slider element not found!");
    return;
  }
  setTimeout(() => slider.classList.add("active"), 500); // ✅ Delay to allow loading
}

            
// click to open fruitt details