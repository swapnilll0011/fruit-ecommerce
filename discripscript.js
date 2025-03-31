// Function to change the main product image based on thumbnail click
function changeImage(imageSrc) {
  document.getElementById("mainImage").src = imageSrc;
}

// Update the total price when quantity changes
document.getElementById("quantityInput").addEventListener("input", function() {
  updatePrice();
});

document.getElementById("increaseBtn").addEventListener("click", function() {
  let quantity = document.getElementById("quantityInput");
  quantity.value = parseInt(quantity.value) + 1;
  updatePrice();
});

document.getElementById("decreaseBtn").addEventListener("click", function() {
  let quantity = document.getElementById("quantityInput");
  if (parseInt(quantity.value) > 1) {
      quantity.value = parseInt(quantity.value) - 1;
      updatePrice();
  }
});

function updatePrice() {
  const price = 64; // Assuming the base price is ₹64
  const quantity = document.getElementById("quantityInput").value;
  const totalPrice = price * quantity;
  document.getElementById("totalPrice").textContent = totalPrice;
}

// Handle adding the product to the cart
function addToCart() {
  document.getElementById("cartMessage").style.display = "block";
  setTimeout(function() {
      document.getElementById("cartMessage").style.display = "none";
  }, 3000);
}

// Toggle the review form visibility
function toggleReviewForm() {
  const reviewForm = document.getElementById("reviewForm");
  reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
}

// Submit the review (for now, just display it in the list)
function submitReview() {
  const reviewText = document.getElementById("reviewText").value;
  if (reviewText) {
      const reviewList = document.getElementById("reviewsList");
      const newReview = document.createElement("p");
      newReview.innerHTML = `<strong>You</strong>: ${reviewText}`;
      reviewList.appendChild(newReview);
      document.getElementById("reviewText").value = ''; // Reset the text area
  }
}
