/* eslint-env browser */
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
      'a, button, [tabindex]:not([tabindex="-1"])'
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
  document.addEventListener('DOMContentLoaded', initBurgerMenu);
} else {
  initBurgerMenu();
}
