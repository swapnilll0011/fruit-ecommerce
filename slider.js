document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider .list");
    const items = document.querySelectorAll(".slider .item");
    const dots = document.querySelectorAll(".dots li");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    let currentIndex = 0;
    const totalSlides = items.length;
    let interval;

    // Function to update slider position
    function updateSlider(index) {
        const translateValue = -index * 100 + "%";
        slider.style.transform = `translateX(${translateValue})`;

        // Update active dot
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    // Function to go to the next slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider(currentIndex);
    }

    // Function to go to the previous slide
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider(currentIndex);
    }

    // Function to start auto-sliding
    function startAutoSlide() {
        interval = setInterval(nextSlide, 3000);
    }

    // Function to stop auto-sliding
    function stopAutoSlide() {
        clearInterval(interval);
    }

    // Event listeners for buttons
    nextBtn.addEventListener("click", function () {
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
    });

    prevBtn.addEventListener("click", function () {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener("click", function () {
            stopAutoSlide();
            currentIndex = index;
            updateSlider(currentIndex);
            startAutoSlide();
        });
    });

    // Start auto-sliding on page load
    startAutoSlide();
});
