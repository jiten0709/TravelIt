$(document).ready(function() {
    function fetchAndDisplayReviews() {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:3000/getreviews",
            contentType: "application/json",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            success: function (response) {
              console.log("Received data:", response);
              displayReviews(response);
            },
            error: function (error) {
              console.error("Error fetching reviews:", error);
            },
          });
        }
  
    function displayReviews(reviews) {
      const reviewsContainer = $('#reviews-container');
      reviewsContainer.empty();
  
      reviews.forEach(review => {
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
      $('.carousel').carousel({
        padding: 200
      });
      autoplay();
    }
  
    function autoplay() {
      $('.carousel').carousel('next');
      setTimeout(autoplay, 3000);
    }
  
    // Call the fetchAndDisplayReviews function to load reviews when the page loads
    fetchAndDisplayReviews();
  });
  