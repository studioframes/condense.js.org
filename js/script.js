// script.js
// Compliance constraints:
// 1. External JS file
// 2. NO innerHTML used
// 3. NO event listeners used

(function () {
  'use strict';

  function setCopiedState(button) {
    button.classList.add('copied');
    button.setAttribute('aria-label', 'Copied');

    window.setTimeout(function () {
      button.classList.remove('copied');
      button.setAttribute('aria-label', 'Copy command');
    }, 1600);
  }

  function fallbackCopy(text, button) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      setCopiedState(button);
    } catch (error) {
      button.setAttribute('aria-label', 'Copy failed');
    }

    document.body.removeChild(textarea);
  }

  function copyCommand(button) {
    var container = button.closest('.cmd-box, .cmd-box-v2');
    if (!container) {
      return;
    }

    var text = container.getAttribute('data-copy-text') || container.textContent.trim();
    if (!text) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setCopiedState(button);
      }).catch(function () {
        fallbackCopy(text, button);
      });
      return;
    }

    fallbackCopy(text, button);
  }

  // Set copyright year safely using textContent
  var yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  var copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      copyCommand(button);
    });
  });

  var heroGrid = document.querySelector('.hero-grid-bg');
  if (heroGrid) {
    window.setTimeout(function () {
      heroGrid.classList.add('visible');
    }, 220);
  }

  // ========================================
  // MOUSE REVEAL EFFECT INITIALIZATION
  // ========================================
  // This effect reveals a background image (bg-5.png) as the user moves their
  // mouse over the hero section, using a radial gradient mask that follows
  // the cursor position.
  //
  // Key features:
  // - Tracks mouse position relative to the hero section
  // - Uses CSS custom properties (variables) to position the radial mask
  // - Smooth fade in/out on mouse enter/leave
  // - Adjustable reveal radius and opacity in the CSS variables

  var heroElement = document.getElementById('top'); // The hero section
  var heroRevealElement = document.getElementById('heroReveal'); // The reveal layer

  if (heroElement && heroRevealElement) {
    // Track mouse movement and update CSS variables for the radial gradient
    heroElement.addEventListener('mousemove', function (event) {
      // Get the hero section's position and dimensions
      var rect = heroElement.getBoundingClientRect();
      
      // Calculate mouse position as percentage within the hero section
      // This ensures the gradient follows the cursor accurately
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      
      var percentX = (x / rect.width) * 100;
      var percentY = (y / rect.height) * 100;
      
      // Update CSS custom properties to position the radial gradient
      // These are used in the mask-image radial-gradient in CSS
      heroRevealElement.style.setProperty('--mouse-x', percentX + '%');
      heroRevealElement.style.setProperty('--mouse-y', percentY + '%');
    });

    // Add active class when mouse enters hero section
    // This triggers the opacity transition to show the revealed image
    heroElement.addEventListener('mouseenter', function () {
      heroRevealElement.classList.add('active');
    });

    // Remove active class when mouse leaves hero section
    // This triggers the opacity transition to hide the revealed image
    heroElement.addEventListener('mouseleave', function () {
      heroRevealElement.classList.remove('active');
    });
  }

  // ========================================
  // HEADER SCROLL EFFECT
  // ========================================
  // Makes the header transparent on initial page load and adds a background
  // when the user scrolls down the page.

  var headerElement = document.querySelector('.header');

  if (headerElement) {
    window.addEventListener('scroll', function () {
      // Add scrolled class if page is scrolled down, remove if at top
      if (window.scrollY > 0) {
        headerElement.classList.add('scrolled');
      } else {
        headerElement.classList.remove('scrolled');
      }
    });
  }
})();
