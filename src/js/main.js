/* eslint-env browser */
/* global Swiper */

// Initialize Swiper when DOM is ready
const initSwiper = () => {
  const swiperElement = document.querySelector('.testimonials_slider');
  if (swiperElement && typeof Swiper !== 'undefined') {
    new Swiper('.testimonials_slider', {
      slidesPerView: 2,
      spaceBetween: 50,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1.1,
          spaceBetween: 15,
        },
        650: {
          slidesPerView: 1.7,
          spaceBetween: 15,
        },
        960: {
          slidesPerView: 2,
          spaceBetween: 25,
        },
        1200: {
          slidesPerView: 2,
          spaceBetween: 50,
        },
      },
    });
  }
};

// Burger menu toggle
const initBurgerMenu = () => {
  const burger = document.querySelector('.header__burger');
  const menu = document.querySelector('.header__menu');
  const body = document.body;

  if (!burger || !menu) {
    return;
  }

  const closeMenu = () => {
    burger.classList.remove('is-active');
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (window.innerWidth < 768) {
      menu.setAttribute('aria-hidden', 'true');
    }
    body.classList.remove('menu-open');
  };

  const openMenu = () => {
    burger.classList.add('is-active');
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    // Focus first menu link when opening
    const firstLink = menu.querySelector('.header__menu-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  };

  // Initialize aria-hidden state (menu is closed by default on mobile)
  const updateAriaHidden = () => {
    if (window.innerWidth < 768) {
      // Only set aria-hidden if menu is actually closed
      if (!burger.classList.contains('is-active')) {
        menu.setAttribute('aria-hidden', 'true');
      }
    } else {
      menu.removeAttribute('aria-hidden');
    }
  };

  updateAriaHidden();

  // Update aria-hidden on window resize
  window.addEventListener('resize', () => {
    updateAriaHidden();
    // Close menu if resizing to desktop
    if (window.innerWidth >= 768 && burger.classList.contains('is-active')) {
      closeMenu();
    }
  });

  burger.addEventListener('click', () => {
    const isActive = burger.classList.contains('is-active');
    if (isActive) {
      closeMenu();
      burger.focus(); // Return focus to button
    } else {
      openMenu();
    }
  });

  // Close menu when clicking on menu links
  const menuLinks = menu.querySelectorAll('.header__menu-link');
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      burger.classList.contains('is-active') &&
      !menu.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      closeMenu();
      burger.focus();
    }
  });

  // Trap focus inside menu when open
  const trapFocus = (e) => {
    if (!burger.classList.contains('is-active')) return;

    const focusableElements = menu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  };

  menu.addEventListener('keydown', trapFocus);

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.classList.contains('is-active')) {
      closeMenu();
      burger.focus();
    }
  });
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initSwiper();
  });
} else {
  initBurgerMenu();
  initSwiper();
}

// Current year
const currentYear = new Date().getFullYear();
const currentYearElement = document.querySelector('.current-year');
if (currentYearElement) {
  currentYearElement.textContent = currentYear;
}

// Before/After slider functionality
const initBeforeAfterSlider = () => {
  const sliders = document.querySelectorAll('.slide-line');

  sliders.forEach((slider, index) => {
    const container = slider.closest('.gallery__item-images');
    if (!container) return;

    const beforeImage = container.querySelector('.gallery__image-before');
    const afterImage = container.querySelector('.gallery__image-after');
    if (!beforeImage || !afterImage) return;

    // Ensure unique IDs for accessibility
    const containerId = `gallery-images-${index + 1}`;
    if (!container.id || (container.id.startsWith('gallery-images-') && container.id === 'gallery-images-2')) {
      container.id = containerId;
    }
    if (!slider.getAttribute('aria-controls') || slider.getAttribute('aria-controls') === 'gallery-images-2') {
      slider.setAttribute('aria-controls', containerId);
    }

    // Improve aria-label with project title if available
    const itemContent = container.closest('.gallery__item')?.querySelector('.gallery__item-title');
    if (itemContent && slider.getAttribute('aria-label')?.includes('Lorem Ipsum')) {
      const projectTitle = itemContent.textContent.trim();
      slider.setAttribute('aria-label', `Drag slider to compare before and after images for ${projectTitle}`);
    }

    let isDragging = false;
    let currentPercentage = 50;
    let dragOffset = 0;

    // Initialize slider position
    const initSlider = () => {
      currentPercentage = 50;
      const clipPathValue = `inset(0 ${100 - currentPercentage}% 0 0)`;
      // Центр слайдера на 50%, учитывая transform: translateX(-50%)
      slider.style.left = `${currentPercentage}%`;
      slider.style.transform = 'translateX(-50%)';
      slider.style.webkitTransform = 'translateX(-50%)';
      // Поддержка iOS Safari
      beforeImage.style.clipPath = clipPathValue;
      beforeImage.style.webkitClipPath = clipPathValue;
      slider.setAttribute('aria-valuenow', currentPercentage);
      slider.setAttribute('aria-valuetext', `${currentPercentage}% - showing ${currentPercentage}% before and ${100 - currentPercentage}% after`);
    };

    const updateSlider = (clientX) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left - dragOffset;
      currentPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      const clipPathValue = `inset(0 ${100 - currentPercentage}% 0 0)`;
      // Центр слайдера на currentPercentage%, учитывая transform: translateX(-50%)
      slider.style.left = `${currentPercentage}%`;
      slider.style.transform = 'translateX(-50%)';
      slider.style.webkitTransform = 'translateX(-50%)';
      // Обрезаем изображение "до" справа, показывая только левую часть до позиции слайдера
      beforeImage.style.clipPath = clipPathValue;
      beforeImage.style.webkitClipPath = clipPathValue;
      const roundedPercentage = Math.round(currentPercentage);
      slider.setAttribute('aria-valuenow', roundedPercentage);
      // Update aria-valuetext for better screen reader experience
      slider.setAttribute('aria-valuetext', `${roundedPercentage}% - showing ${roundedPercentage}% before and ${100 - roundedPercentage}% after`);
    };

    const handleStart = (clientX, isClickOnSlider = false) => {
      isDragging = true;
      slider.style.transition = 'none';
      beforeImage.style.transition = 'none';
      
      if (isClickOnSlider) {
        // При клике на слайдер запоминаем смещение от центра
        const sliderRect = slider.getBoundingClientRect();
        const sliderCenterX = sliderRect.left + sliderRect.width / 2;
        dragOffset = clientX - sliderCenterX;
      } else {
        dragOffset = 0;
      }
      
      updateSlider(clientX);
    };

    const handleMove = (clientX) => {
      if (!isDragging) return;
      updateSlider(clientX);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      slider.style.transition = '';
      beforeImage.style.transition = '';
    };

    // Initialize on load
    initSlider();

    // Mouse events
    slider.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleStart(e.clientX, true);
    });

    const mouseMoveHandler = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const mouseUpHandler = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    // Touch events
    slider.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleStart(e.touches[0].clientX, true);
    });

    const touchMoveHandler = (e) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    };

    const touchEndHandler = () => {
      handleEnd();
    };

    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler);

    // Keyboard navigation
    slider.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 1;
      let newPercentage = currentPercentage;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newPercentage = Math.max(0, currentPercentage - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPercentage = Math.min(100, currentPercentage + step);
          break;
        case 'Home':
          e.preventDefault();
          newPercentage = 0;
          break;
        case 'End':
          e.preventDefault();
          newPercentage = 100;
          break;
        default:
          return;
      }

      currentPercentage = newPercentage;
      const rect = container.getBoundingClientRect();
      const clientX = rect.left + (currentPercentage / 100) * rect.width;
      updateSlider(clientX);
    });

    // Click on container to move slider
    container.addEventListener('click', (e) => {
      if (e.target === slider || slider.contains(e.target)) return;
      updateSlider(e.clientX);
    });
  });
};

// Video player functionality
const initVideoPlayer = () => {
  const videoWrappers = document.querySelectorAll('.video__item-wrapper');

  videoWrappers.forEach((wrapper, index) => {
    const playButton = wrapper.querySelector('.video__item-play-btn-wrapper');
    const video = wrapper.querySelector('.video__item-video');

    if (!playButton || !video) return;

    // Ensure unique IDs for accessibility
    const videoId = `video-${index + 1}`;
    if (!video.id || video.id === 'video-1') {
      video.id = videoId;
    }
    if (!playButton.getAttribute('aria-controls') || playButton.getAttribute('aria-controls') === 'video-1') {
      playButton.setAttribute('aria-controls', videoId);
    }

    // Hide controls initially
    video.removeAttribute('controls');

    // Play video on button click
    const playVideo = () => {
      // Unmute video before playing (required for autoplay policies)
      video.muted = false;
      video.play().then(() => {
        // Show controls after video starts playing
        video.setAttribute('controls', 'controls');
        playButton.style.display = 'none';
      }).catch((error) => {
        console.error('Error playing video:', error);
        // If autoplay fails, try with muted
        video.muted = true;
        video.play().then(() => {
          video.setAttribute('controls', 'controls');
          playButton.style.display = 'none';
        });
      });
    };

    playButton.addEventListener('click', playVideo);

    // Show play button when video is paused or ended
    const showPlayButton = () => {
      if (video.paused || video.ended) {
        playButton.style.display = 'block';
        video.removeAttribute('controls');
      }
    };

    // Hide play button when video is playing
    const hidePlayButton = () => {
      if (!video.paused && !video.ended) {
        playButton.style.display = 'none';
        video.setAttribute('controls', 'controls');
      }
    };

    video.addEventListener('play', hidePlayButton);
    video.addEventListener('pause', showPlayButton);
    video.addEventListener('ended', showPlayButton);

    // Handle video click to play/pause
    video.addEventListener('click', () => {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  });
};

// Initialize before/after slider
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBeforeAfterSlider();
    initVideoPlayer();
  });
} else {
  initBeforeAfterSlider();
  initVideoPlayer();
}