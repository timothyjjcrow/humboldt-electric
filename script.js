document.addEventListener("DOMContentLoaded", function () {
  // Header scroll effect
  const header = document.querySelector(".site-header");

  // Add variables for hide-on-scroll behavior
  let lastScrollTop = 0;
  let scrollThreshold = 5; // Reduced from 20 to 5 to make it more responsive
  let isScrollingUp = false;

  // Debug: Check if header element is found
  if (!header) {
    console.error("Navigation header element not found!");
  } else {
    console.log("Navigation header found:", header);
  }

  window.addEventListener("scroll", function () {
    // Original scrolled effect
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
      // Also ensure nav-hidden is removed at the top
      header.classList.remove("nav-hidden");
    }

    // New hide-on-scroll behavior
    const currentScrollTop =
      window.scrollY || document.documentElement.scrollTop;

    // Don't apply hide logic if at the top of page
    if (currentScrollTop <= 50) {
      header.classList.remove("nav-hidden");
      lastScrollTop = currentScrollTop;
      return;
    }

    // Force immediate response when scrolling significantly
    if (Math.abs(lastScrollTop - currentScrollTop) > 50) {
      isScrollingUp = currentScrollTop < lastScrollTop;
      if (isScrollingUp) {
        header.classList.remove("nav-hidden");
        // Debug
        console.log("Large scroll UP detected - showing nav");
      } else {
        header.classList.add("nav-hidden");
        // Debug
        console.log("Large scroll DOWN detected - hiding nav");
      }
      lastScrollTop = currentScrollTop;
      return;
    }

    // Regular check for smaller scrolls
    // Determine if we're scrolling up or down
    isScrollingUp = currentScrollTop < lastScrollTop;

    // If scrolled more than threshold
    if (Math.abs(lastScrollTop - currentScrollTop) > scrollThreshold) {
      if (isScrollingUp) {
        // Scrolling up, show the header
        header.classList.remove("nav-hidden");
      } else {
        // Scrolling down, hide the header
        header.classList.add("nav-hidden");
      }
      lastScrollTop = currentScrollTop;
    }
  });

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
        document.body.style.overflow = "hidden";
      });
    });

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
      closeModal.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      });
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
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
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

    const AUTO_SCROLL_INTERVAL = 7000;
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
});
