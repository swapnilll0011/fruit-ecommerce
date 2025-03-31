// Load slider.html into #slider-container
fetch('slider.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('slider-container');
        container.innerHTML = data;

        // Wait for DOM update, then execute scripts inside slider.html
        setTimeout(() => {
            const scripts = container.querySelectorAll("script");
            scripts.forEach(script => {
                const newScript = document.createElement("script");
                newScript.textContent = script.textContent; // Run inline script
                document.body.appendChild(newScript);
            });
        }, 100); // Small delay ensures HTML is fully loaded before running script
    })
    .catch(error => console.error('Error loading slider:', error));
