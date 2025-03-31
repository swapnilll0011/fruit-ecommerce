document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.getElementById("feedback-form");
  const confirmationMessage = document.getElementById("confirmation");

  feedbackForm.addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const rating = document.getElementById("rating").value;
    const comments = document.getElementById("comments").value;
    const token = localStorage.getItem("token");

    console.log("Token being sent:", token); // Debugging log

    if (!token) {
      alert("You are not logged in! Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/submit-feedback", { // Ensure correct URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comments }),
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Failed to submit feedback.";
        } catch {
          errorMessage = "Server error. Please try again.";
        }
        throw new Error(errorMessage);
      }

      // Show confirmation message
      confirmationMessage.style.display = "block";
      feedbackForm.reset();

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "front-home.html"; // Redirect to front-home.html
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.message);
    }
  });
});
