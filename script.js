document.addEventListener("DOMContentLoaded", function () {
  // Header scroll effect
  const header = document.querySelector(".site-header");

  // Simpler scroll handling approach
  let lastScrollY = window.scrollY;
  let direction = "none";

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Actual scroll handling
  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Determine scroll direction
    direction = currentScrollY > lastScrollY ? "down" : "up";

    // Skip tiny scrolls (touchpad sensitivity)
    if (Math.abs(currentScrollY - lastScrollY) < 5) return;

    // Don't hide header when at the top
    if (currentScrollY < 100) {
      header.classList.remove("nav-hidden");
      header.classList.remove("scrolled");
    } else {
      header.classList.add("scrolled");

      if (direction === "down") {
        header.classList.add("nav-hidden");
      } else {
        header.classList.remove("nav-hidden");
      }
    }

    lastScrollY = currentScrollY;
  }

  // Use both regular and debounced versions for better responsiveness
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener(
    "scroll",
    debounce(() => {
      if (window.scrollY < 100) {
        header.classList.remove("nav-hidden");
      }
    }, 250),
    { passive: true }
  );

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
      // Optional: Add ARIA attributes for accessibility
      const isExpanded = mainNav.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);

      // Prevent scrolling when menu is open
      if (isExpanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      mainNav &&
      mainNav.classList.contains("active") &&
      !e.target.closest(".main-nav") &&
      !e.target.closest(".menu-toggle")
    ) {
      mainNav.classList.remove("active");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      e.preventDefault();
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Close mobile menu if open
        if (mainNav && mainNav.classList.contains("active")) {
          mainNav.classList.remove("active");
          menuToggle.classList.remove("active");
          document.body.style.overflow = "auto";
        }

        // Calculate header height for offset
        const headerHeight = header.offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Update current year in footer
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Gallery functionality
  const galleryItems = document.querySelectorAll(".gallery-item");
  const modal = document.querySelector(".gallery-modal");
  const modalImg = document.getElementById("modal-image");
  const modalCaptionTitle = document.querySelector(".modal-caption h4");
  const modalCaptionText = document.querySelector(".modal-caption p");
  const closeModal = document.querySelector(".modal-close");
  const prevBtn = document.querySelector(".modal-prev");
  const nextBtn = document.querySelector(".modal-next");
  const modalImageCounter = document.getElementById("modal-image-counter");

  let currentItems = [...galleryItems];
  let currentIndex = 0;
  // Store the original overflow value to restore it later
  const originalBodyOverflow = window.getComputedStyle(document.body).overflow;

  // Gallery modal
  if (galleryItems.length > 0 && modal) {
    galleryItems.forEach((item, index) => {
      item.addEventListener("click", function () {
        currentIndex = currentItems.indexOf(item);
        if (currentIndex === -1) return;

        const img = this.querySelector("img");
        const altText = img.getAttribute("alt") || "Image Description";

        if (modalImg) modalImg.src = img.src;
        if (modalCaptionText) modalCaptionText.innerHTML = "";
        if (modalImageCounter) {
          modalImageCounter.textContent = `Image ${currentIndex + 1} of ${
            currentItems.length
          }`;
        }

        modal.classList.add("active");
        // Save current scroll position and hide scrollbar
        document.body.style.overflow = "hidden";
        // Prevent any width changes
        document.body.style.paddingRight = getScrollbarWidth() + "px";
      });
    });

    // Helper function to get scrollbar width
    function getScrollbarWidth() {
      // Create a temporary div to measure scrollbar width
      const scrollDiv = document.createElement("div");
      scrollDiv.style.cssText =
        "width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;";
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    // Helper function to close the modal and restore scrolling properly
    function closeGalleryModal() {
      modal.classList.remove("active");
      // Restore original overflow and remove padding adjustment
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = "0";
    }

    const updateModalContent = (index) => {
      if (index < 0 || index >= currentItems.length) return;
      const item = currentItems[index];
      const img = item.querySelector("img");
      const altText = img.getAttribute("alt") || "Image Description";

      if (modalImg) modalImg.src = img.src;
      if (modalCaptionText) modalCaptionText.innerHTML = "";
      if (modalImageCounter) {
        modalImageCounter.textContent = `Image ${index + 1} of ${
          currentItems.length
        }`;
      }
    };

    if (closeModal) {
      closeModal.addEventListener("click", closeGalleryModal);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentIndex =
          (currentIndex - 1 + currentItems.length) % currentItems.length;
        updateModalContent(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % currentItems.length;
        updateModalContent(currentIndex);
      });
    }

    // Swipe functionality
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50;

    modal.addEventListener(
      "touchstart",
      function (event) {
        if (
          event.target === modalImg ||
          event.target === prevBtn ||
          event.target === nextBtn
        ) {
        }
        touchstartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );

    modal.addEventListener(
      "touchend",
      function (event) {
        touchendX = event.changedTouches[0].screenX;
        handleSwipe();
      },
      false
    );

    function handleSwipe() {
      if (!modal.classList.contains("active")) return;
      if (touchendX < touchstartX - swipeThreshold) {
        if (nextBtn) nextBtn.click();
      }
      if (touchendX > touchstartX + swipeThreshold) {
        if (prevBtn) prevBtn.click();
      }
    }

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeGalleryModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (modal.classList.contains("active")) {
        if (e.key === "Escape") {
          if (closeModal) closeModal.click();
        } else if (e.key === "ArrowLeft") {
          if (prevBtn) prevBtn.click();
        } else if (e.key === "ArrowRight") {
          if (nextBtn) nextBtn.click();
        }
      }
    });
  }

  // Animate elements when they come into view
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(
      ".service-card, .gallery-item, .feature-item, .contact-card, .about-image, .video-container"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;

      if (elementPosition < screenPosition) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }
    });
  };

  // Add initial styles for animation
  document
    .querySelectorAll(
      ".service-card, .gallery-item, .feature-item, .contact-card, .about-image, .video-container"
    )
    .forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

  // Run animation on scroll
  window.addEventListener("scroll", animateOnScroll);

  // Run once on page load
  animateOnScroll();

  // NEW FULLPAGE CAROUSEL LOGIC
  function initializeFullPageCarousels() {
    const carousels = document.querySelectorAll(".fullpage-carousel");
    if (carousels.length === 0) return;

    const AUTO_SCROLL_INTERVAL = 12000;
    const carouselImagePaths = {
      "lutron-shades": Array.from(
        { length: 23 },
        (_, i) => `images/carousel-lutron/page_${i + 1}.png`
      ),
      radiora3: Array.from(
        { length: 26 },
        (_, i) => `images/carousel-radiora3/page_${i + 1}.png`
      ),
    };

    // --- Helper: Create slides for a carousel ---
    function createSlides(slidesWrapper, images) {
      slidesWrapper.innerHTML = ""; // Clear existing slides
      images.forEach((imagePath, index) => {
        const slide = document.createElement("div");
        slide.classList.add("carousel-slide");
        slide.dataset.index = index;
        const img = document.createElement("img");
        img.src = imagePath;
        img.alt = `Slide ${index + 1}`;
        img.loading = index === 0 ? "eager" : "lazy"; // Eager load first, lazy load others
        slide.appendChild(img);
        slidesWrapper.appendChild(slide);
      });
      return slidesWrapper.querySelectorAll(".carousel-slide");
    }

    // --- Helper: Create pagination for a carousel ---
    function createPagination(
      paginationContainer,
      numSlides,
      carouselElement,
      slides
    ) {
      paginationContainer.innerHTML = "";
      for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.dataset.index = i;
        dot.addEventListener("click", () => {
          goToSlide(
            carouselElement,
            i,
            slides,
            paginationContainer.querySelectorAll(".dot")
          );
          stopAutoScrollForCarousel(carouselElement); // Stop auto-scroll on manual interaction
          startAutoScrollForCarousel(
            carouselElement,
            slides,
            paginationContainer.querySelectorAll(".dot")
          ); // Restart auto-scroll
        });
        paginationContainer.appendChild(dot);
      }
      return paginationContainer.querySelectorAll(".dot");
    }

    // --- Helper: Update active slide and pagination ---
    function updateActiveSlide(
      carouselElement,
      newIndex,
      slides,
      paginationDots
    ) {
      const currentSlideIndex = parseInt(
        carouselElement.dataset.currentSlideIndex || "0"
      );
      slides[currentSlideIndex]?.classList.remove("active");
      paginationDots[currentSlideIndex]?.classList.remove("active");

      slides[newIndex]?.classList.add("active");
      paginationDots[newIndex]?.classList.add("active");
      carouselElement.dataset.currentSlideIndex = newIndex;
    }

    // --- Helper: Go to a specific slide ---
    function goToSlide(carouselElement, slideIndex, slides, paginationDots) {
      const numSlides = slides.length;
      let newIndex = slideIndex;
      if (newIndex < 0) {
        newIndex = numSlides - 1;
      } else if (newIndex >= numSlides) {
        newIndex = 0;
      }
      updateActiveSlide(carouselElement, newIndex, slides, paginationDots);
    }

    // --- Helper: Start auto-scroll for a specific carousel ---
    function startAutoScrollForCarousel(
      carouselElement,
      slides,
      paginationDots
    ) {
      stopAutoScrollForCarousel(carouselElement); // Clear existing interval if any

      const intervalId = setInterval(() => {
        let currentIndex = parseInt(
          carouselElement.dataset.currentSlideIndex || "0"
        );
        goToSlide(
          carouselElement,
          (currentIndex + 1) % slides.length,
          slides,
          paginationDots
        );
      }, AUTO_SCROLL_INTERVAL);
      carouselElement.dataset.intervalId = intervalId;
    }

    // --- Helper: Stop auto-scroll for a specific carousel ---
    function stopAutoScrollForCarousel(carouselElement) {
      if (carouselElement.dataset.intervalId) {
        clearInterval(parseInt(carouselElement.dataset.intervalId));
        delete carouselElement.dataset.intervalId;
      }
    }

    // --- Helper: Setup a specific carousel's DOM and event listeners ---
    function setupSpecificCarousel(carouselElement) {
      const carouselId = carouselElement.dataset.carouselId;
      const images = carouselImagePaths[carouselId] || [];
      if (images.length === 0) return;

      const slidesWrapper = carouselElement.querySelector(".carousel-slides");
      const navPrev = carouselElement.querySelector(".carousel-prev");
      const navNext = carouselElement.querySelector(".carousel-next");
      const paginationContainer = carouselElement.querySelector(
        ".carousel-pagination"
      );

      if (!slidesWrapper || !navPrev || !navNext || !paginationContainer) {
        console.error("Carousel structure missing for ID:", carouselId);
        return;
      }

      const slides = createSlides(slidesWrapper, images);
      const paginationDots = createPagination(
        paginationContainer,
        images.length,
        carouselElement,
        slides
      );

      carouselElement.dataset.currentSlideIndex = "0"; // Initialize current slide index
      updateActiveSlide(carouselElement, 0, slides, paginationDots);

      navPrev.addEventListener("click", () => {
        let currentIndex = parseInt(
          carouselElement.dataset.currentSlideIndex || "0"
        );
        goToSlide(carouselElement, currentIndex - 1, slides, paginationDots);
        stopAutoScrollForCarousel(carouselElement);
        startAutoScrollForCarousel(carouselElement, slides, paginationDots);
      });

      navNext.addEventListener("click", () => {
        let currentIndex = parseInt(
          carouselElement.dataset.currentSlideIndex || "0"
        );
        goToSlide(carouselElement, currentIndex + 1, slides, paginationDots);
        stopAutoScrollForCarousel(carouselElement);
        startAutoScrollForCarousel(carouselElement, slides, paginationDots);
      });

      carouselElement.dataset.isInitialized = "true";
      // Return slides and dots for the observer to use when starting scroll
      return { slides, paginationDots };
    }

    // --- Intersection Observer Logic ---
    const observerOptions = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.01, // Trigger when 1% of the element is visible
    };

    const intersectionCallback = (entries, observer) => {
      entries.forEach((entry) => {
        const carouselElement = entry.target;
        if (entry.isIntersecting) {
          let slides, paginationDots;
          if (carouselElement.dataset.isInitialized !== "true") {
            const setupResult = setupSpecificCarousel(carouselElement);
            if (setupResult) {
              slides = setupResult.slides;
              paginationDots = setupResult.paginationDots;
            }
          } else {
            // Already initialized, retrieve slides and dots if needed (might not be necessary if they persist)
            const slidesWrapper =
              carouselElement.querySelector(".carousel-slides");
            slides = slidesWrapper
              ? slidesWrapper.querySelectorAll(".carousel-slide")
              : [];
            const paginationContainer = carouselElement.querySelector(
              ".carousel-pagination"
            );
            paginationDots = paginationContainer
              ? paginationContainer.querySelectorAll(".dot")
              : [];
          }

          if (
            slides &&
            slides.length > 0 &&
            paginationDots &&
            paginationDots.length > 0
          ) {
            startAutoScrollForCarousel(carouselElement, slides, paginationDots);
          }
        } else {
          stopAutoScrollForCarousel(carouselElement);
        }
      });
    };

    const carouselObserver = new IntersectionObserver(
      intersectionCallback,
      observerOptions
    );

    carousels.forEach((carouselElement) => {
      carouselObserver.observe(carouselElement);
    });
  }

  // Call the initialization function
  initializeFullPageCarousels();

  // PDF download button hover effect (This can be removed if no .pdf-download buttons exist anymore)
  // const pdfDownloadBtns = document.querySelectorAll(".pdf-download");
  // pdfDownloadBtns.forEach((btn) => {
  //   btn.addEventListener("mouseenter", function () {
  //     const span = this.querySelector("span");
  //     if (span) span.textContent = "Download PDF";
  //   });
  //   btn.addEventListener("mouseleave", function () {
  //     const span = this.querySelector("span");
  //     if (span) span.textContent = "Download";
  //   });
  // });

  // Contact Form Functionality
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default page reload

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const serviceInput = document.getElementById("service");
      const messageInput = document.getElementById("message");
      const submitButton = contactForm.querySelector("button[type='submit']");

      // Basic Client-Side Validation
      let isValid = true;
      let errors = [];

      // Clear previous error messages
      document.querySelectorAll(".error-message").forEach((el) => el.remove());

      function displayError(inputElement, message) {
        isValid = false;
        errors.push(message); // Collect all errors
        const errorEl = document.createElement("p");
        errorEl.className = "error-message";
        errorEl.style.color = "var(--error)";
        errorEl.style.fontSize = "0.85rem";
        errorEl.style.marginTop = "0.25rem";
        errorEl.textContent = message;
        inputElement.parentNode.appendChild(errorEl);
      }

      if (nameInput.value.trim() === "") {
        displayError(nameInput, "Full Name is required.");
      }
      if (emailInput.value.trim() === "") {
        displayError(emailInput, "Email Address is required.");
      } else if (!/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
        displayError(emailInput, "Please enter a valid email address.");
      }
      if (messageInput.value.trim() === "") {
        displayError(messageInput, "Message is required.");
      } else if (messageInput.value.trim().length < 10) {
        displayError(
          messageInput,
          "Message should be at least 10 characters long."
        );
      }
      // Optional: Basic phone validation (e.g., at least 7 digits)
      if (
        phoneInput.value.trim() !== "" &&
        !/^\d{7,}$/.test(phoneInput.value.replace(/\D/g, ""))
      ) {
        displayError(phoneInput, "Please enter a valid phone number.");
      }

      if (!isValid) {
        // Optionally, display a general error message or focus the first invalid field
        const firstErrorField =
          contactForm.querySelector(".error-message").previousElementSibling;
        if (firstErrorField) firstErrorField.focus();
        return; // Stop if validation fails
      }

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Change button text to indicate processing
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;

      // Replace 'YOUR_FORM_ENDPOINT_HERE' with the actual URL from Formspree, Netlify, etc.
      const formEndpoint = "https://formspree.io/f/xgvkdyvk"; // MODIFIED - User provided endpoint

      try {
        // Simulate network delay for testing UI
        // await new Promise(resolve => setTimeout(resolve, 1500));

        // IMPORTANT: This is where you would use fetch to send data to your backend or form service
        // For now, we'll just log to console and simulate success.
        // console.log("Form data submitted:", data); // Keep for debugging if needed, but main action is fetch
        const response = await fetch(formEndpoint, {
          method: "POST",
          body: JSON.stringify(data), // Or formData directly if the service supports it
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // Many services prefer this
          },
        });

        if (!response.ok) {
          // Try to get error message from service if available
          let errorData = {
            message: `Error: ${response.status} ${response.statusText}`,
          };
          try {
            errorData = await response.json();
          } catch (e) {
            /* Do nothing if response is not json */
          }
          throw new Error(
            errorData.message ||
              `Form submission failed. Server responded with ${response.status}`
          );
        }

        // // Assuming success for now // This line is commented out as actual success is handled by fetch
        const successMessageContainer = document.createElement("div");
        successMessageContainer.textContent =
          "Thank you! Your message has been sent successfully.";
        successMessageContainer.style.color = "var(--success)";
        successMessageContainer.style.backgroundColor =
          "rgba(76, 175, 80, 0.1)";
        successMessageContainer.style.padding = "1rem";
        successMessageContainer.style.borderRadius = "var(--border-radius-sm)";
        successMessageContainer.style.marginTop = "1rem";
        successMessageContainer.style.border = "1px solid var(--success)";
        contactForm.parentNode.insertBefore(
          successMessageContainer,
          contactForm.nextSibling
        );

        contactForm.reset(); // Clear the form
        setTimeout(() => successMessageContainer.remove(), 7000); // Remove success message after 7s
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMessageContainer = document.createElement("div");
        errorMessageContainer.textContent = `Error: ${
          error.message || "Could not send message. Please try again later."
        }`;
        errorMessageContainer.style.color = "var(--error)";
        errorMessageContainer.style.backgroundColor = "rgba(244, 67, 54, 0.1)";
        errorMessageContainer.style.padding = "1rem";
        errorMessageContainer.style.borderRadius = "var(--border-radius-sm)";
        errorMessageContainer.style.marginTop = "1rem";
        errorMessageContainer.style.border = "1px solid var(--error)";
        // Insert error above the form or after the button
        submitButton.parentNode.insertBefore(
          errorMessageContainer,
          submitButton.nextSibling
        );
        setTimeout(() => errorMessageContainer.remove(), 7000);
      } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }

  // Instagram Feed Integration
  function loadInstagramFeed() {
    const instagramFeed = document.getElementById("instagram-feed");
    if (!instagramFeed) return;

    try {
      // Use Instagram's official embed HTML directly - this is the most reliable approach
      instagramFeed.innerHTML = `
        <div style="display: flex; justify-content: center; margin: 0 auto; width: 100%;">
          <blockquote 
            class="instagram-media" 
            data-instgrm-captioned 
            data-instgrm-permalink="https://www.instagram.com/p/Cq8yYQ_uGci/"
            data-instgrm-version="14" 
            style="background:#FFF; border:0; border-radius:8px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px); max-width: 540px;">
            <div style="padding:16px;">
              <a href="https://www.instagram.com/p/Cq8yYQ_uGci/" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
                <div style="display: flex; flex-direction: row; align-items: center;">
                  <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                  <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                  </div>
                </div>
                <div style="padding: 19% 0;"></div>
                <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                  <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                        <g>
                          <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <div style="padding-top: 8px;">
                  <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this profile on Instagram</div>
                </div>
                <div style="padding: 12.5% 0;"></div>
                <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
                  <div>
                    <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
                    <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
                    <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
                  </div>
                  <div style="margin-left: 8px;">
                    <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                    <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
                  </div>
                  <div style="margin-left: auto;">
                    <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
                    <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
                    <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;">
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div>
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
                </div>
              </a>
            </div>
          </blockquote>
        </div>
      `;

      // Load Instagram embed script
      if (!document.getElementById("instagram-embed-script")) {
        const script = document.createElement("script");
        script.id = "instagram-embed-script";
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.defer = true;

        // Add crossorigin attribute to help with potential CORS issues
        script.crossOrigin = "anonymous";

        // Process embeds when script loads
        script.onload = () => {
          console.log("Instagram script loaded");
          if (window.instgrm) {
            console.log("Processing Instagram embeds");
            window.instgrm.Embeds.process();
          } else {
            console.error("Instagram embed object not available");
          }
        };

        document.body.appendChild(script);
      } else if (window.instgrm) {
        // If script already loaded, process the embeds
        window.instgrm.Embeds.process();
      }
    } catch (error) {
      console.error("Error loading Instagram feed:", error);
      instagramFeed.innerHTML =
        '<div class="instagram-error"><i class="fas fa-exclamation-circle"></i><span>Could not load Instagram feed. Please try again later.</span></div>';
    }
  }

  // Initialize Instagram Feed
  loadInstagramFeed();
});
