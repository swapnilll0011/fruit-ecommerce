document.addEventListener("DOMContentLoaded", function () {
    fetch("Footer.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Footer not found");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;

            // Select the button after loading footer
            const backToTopButton = document.getElementById("backToTop");

            window.addEventListener("scroll", () => {
                // Check if user has reached the bottom
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                    backToTopButton.style.display = "block"; // Show button
                } else {
                    backToTopButton.style.display = "none"; // Hide button
                }
            });

            backToTopButton.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        })
        .catch(error => console.error("Error loading footer:", error));
});
