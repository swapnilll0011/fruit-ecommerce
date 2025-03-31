function showToastMessage(message) {
    const toast = document.getElementById("toast-message");
    toast.innerText = message; // Set message dynamically
    toast.classList.remove("hidden"); // Show the toast
  
    setTimeout(() => {
      toast.classList.add("hidden"); // Hide the toast after 3 seconds
    }, 3000);
  }
  