/**
 * Badge Removal Utility
 * 
 * This script provides runtime detection and removal of platform badges
 * that may be dynamically injected into the page.
 */

// Badge removal configuration
const BADGE_PATTERNS = {
  ids: [
    'bolt-badge',
    /bolt.*badge/i,
    /badge.*bolt/i,
    /platform.*badge/i,
    /builder.*badge/i,
  ],
  classes: [
    'bolt-badge',
    /bolt.*badge/i,
    /badge.*bolt/i,
    /made.*in/i,
    /powered.*by/i,
    /built.*with/i,
    /platform.*badge/i,
  ],
  attributes: [
    'data-bolt-badge',
    'data-badge',
    'data-platform',
    'data-branding',
    'data-watermark',
  ],
  urls: [
    /bolt\.new/i,
    /bolt\.diy/i,
  ],
};

/**
 * Check if element matches badge patterns
 */
function isBadgeElement(element) {
  // Check ID
  if (element.id) {
    const matches = BADGE_PATTERNS.ids.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(element.id);
      }
      return element.id === pattern;
    });
    if (matches) return true;
  }

  // Check classes
  if (element.className && typeof element.className === 'string') {
    const matches = BADGE_PATTERNS.classes.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(element.className);
      }
      return element.className.includes(pattern);
    });
    if (matches) return true;
  }

  // Check data attributes
  const hasDataAttribute = BADGE_PATTERNS.attributes.some(attr => 
    element.hasAttribute(attr)
  );
  if (hasDataAttribute) return true;

  // Check if it's an iframe with badge-related src
  if (element.tagName === 'IFRAME' && element.src) {
    const matches = BADGE_PATTERNS.urls.some(pattern => 
      pattern.test(element.src)
    );
    if (matches) return true;
  }

  // Check if it's a link to badge-related URL
  if (element.tagName === 'A' && element.href) {
    const matches = BADGE_PATTERNS.urls.some(pattern => 
      pattern.test(element.href)
    );
    if (matches) return true;
  }

  // Check for fixed position elements in bottom corners
  if (element.style && element.style.position === 'fixed') {
    const computedStyle = window.getComputedStyle(element);
    const bottom = computedStyle.bottom;
    const right = computedStyle.right;
    
    // Check if it's positioned in bottom-right corner (typical badge placement)
    if (bottom && right && 
        parseInt(bottom) < 100 && 
        parseInt(right) < 100) {
      return true;
    }
  }

  return false;
}

/**
 * Remove a badge element from the DOM
 */
function removeBadgeElement(element) {
  try {
    // Apply multiple removal strategies
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.height = '0';
    element.style.width = '0';
    element.style.overflow = 'hidden';
    element.setAttribute('aria-hidden', 'true');
    
    // Actually remove from DOM
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  } catch (error) {
    console.warn('Failed to remove badge element:', error);
  }
}

/**
 * Scan and remove all badge elements
 */
function scanAndRemoveBadges() {
  const allElements = document.querySelectorAll('*');
  let removedCount = 0;

  allElements.forEach(element => {
    if (isBadgeElement(element)) {
      removeBadgeElement(element);
      removedCount++;
    }
  });

  return removedCount;
}

/**
 * Set up mutation observer to watch for dynamically added badges
 */
function setupBadgeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (isBadgeElement(node)) {
            removeBadgeElement(node);
          }
          // Check children of added node
          if (node.querySelectorAll) {
            const badgeChildren = Array.from(node.querySelectorAll('*')).filter(isBadgeElement);
            badgeChildren.forEach(removeBadgeElement);
          }
        }
      });

      // Check modified attributes
      if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
        if (isBadgeElement(mutation.target)) {
          removeBadgeElement(mutation.target);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'style', 'data-bolt-badge', 'data-badge'],
  });

  return observer;
}

/**
 * Initialize badge removal system
 */
export function initBadgeRemoval() {
  // Initial scan
  console.log('Initializing badge removal system...');
  
  // Remove badges on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const count = scanAndRemoveBadges();
      console.log(`Removed ${count} badge elements on DOMContentLoaded`);
    });
  } else {
    const count = scanAndRemoveBadges();
    console.log(`Removed ${count} badge elements immediately`);
  }

  // Set up observer for dynamic content
  setupBadgeObserver();

  // Periodic scan as fallback (every 2 seconds)
  setInterval(() => {
    const count = scanAndRemoveBadges();
    if (count > 0) {
      console.log(`Removed ${count} dynamically added badge elements`);
    }
  }, 2000);

  console.log('Badge removal system active');
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  initBadgeRemoval();
}