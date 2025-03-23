$(document).ready(function () {
  function fetchAndDisplayReviews(sentiment) {
    $.ajax({
      type: "GET",
      url: "http://localhost:5004/getreviews",
      data: {
        sentiment: sentiment, // 'positive' or 'negative'
      },
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      success: function (response) {
        console.log("Received data from display.js:", response);
        displayReviews(response);
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
      // const reviewElement = `
      //     <a class="carousel-item" href="#">
      //       <div class="testi">
      //         <div class="img-area">
      //           <img src="${review.image_url}" alt="img">
      //         </div>
      //         <p>"${review.comment}"</p>
      //         <h4>${review.name}</h4>
      //       </div>
      //     </a>
      //   `;
      const reviewElement = `
          <a class="carousel-item" href="#">
            <div class="testi">
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
  fetchAndDisplayReviews('negative');
});
