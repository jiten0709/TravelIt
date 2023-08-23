$(document).ready(function () {
  function fetchAndDisplayReviews(sentiment) {
    $.ajax({
      type: "POST", // Change to POST method
      url: "http://127.0.0.1:3000/action", // Use the appropriate endpoint
      data: {
        action: "fetchPositive",
        sentiment: sentiment, // 'positive' or 'negative'
      },
      contentType: "application/json",
      success: function (response) {
        console.log("Received data:", response.data);
        displayReviews(response.data);
      },
      error: function (error) {
        console.error("Error fetching reviews:", error);
      },
    });
  }

  // Button click event handlers
  $(".positive-btn").on("click", function () {
    fetchAndDisplayReviews("positive");
  });

  $(".negative-btn").on("click", function () {
    fetchAndDisplayReviews("negative");
  });

  function displayReviews(reviews) {
    const reviewsContainer = $("#reviews-container");
    reviewsContainer.empty();

    reviews.forEach((review) => {
      const reviewElement = `
          <a class="carousel-item" href="#">
            <div class="testi">
              <div class="img-area">
                <img src="${review.image_url}" alt="img">
              </div>
              <p>"${review.comment}"</p>
              <h4>${review.name}</h4>
            </div>
          </a>
        `;
      reviewsContainer.append(reviewElement);
    });

    // Initialize the carousel after reviews are loaded
    $(".carousel").carousel({
      padding: 200,
    });
    autoplay();
  }

  function autoplay() {
    $(".carousel").carousel("next");
    setTimeout(autoplay, 3000);
  }

  // Call the fetchAndDisplayReviews function to load reviews when the page loads
  fetchAndDisplayReviews("positive"); // Default to positive reviews initially
});
