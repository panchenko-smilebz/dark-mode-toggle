function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== 'string' || attrVal.trim() === '') return defaultVal;
    if (attrVal === 'true' && defaultValType === 'boolean') return true;
    if (attrVal === 'false' && defaultValType === 'boolean') return false;
    if (isNaN(attrVal) && defaultValType === 'string') return attrVal;
    if (!isNaN(attrVal) && defaultValType === 'number') return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  const computed = getComputedStyle(htmlElement);
  let toggleEl;
  let togglePressed = 'true'; // Changed to 'true' as dark mode is default

  const scriptTag = document.querySelector('[tr-color-vars]');
  if (!scriptTag) {
    console.warn('Script tag with tr-color-vars attribute not found');
    return;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute('duration'));
  let colorModeEase = attr('power1.out', scriptTag.getAttribute('ease'));

  const cssVariables = scriptTag.getAttribute('tr-color-vars');
  if (!cssVariables.length) {
    console.warn('Value of tr-color-vars attribute not found');
    return;
  }

  let lightColors = {};
  let darkColors = {};
  cssVariables.split(',').forEach(function (item) {
    let lightValue = computed.getPropertyValue(`--color--${item}`);
    let darkValue = computed.getPropertyValue(`--dark--${item}`);
    if (lightValue.length) {
      if (!darkValue.length) darkValue = lightValue;
      lightColors[`--color--${item}`] = lightValue;
      darkColors[`--color--${item}`] = darkValue;
    }
  });

  if (!Object.keys(lightColors).length) {
    console.warn('No variables found matching tr-color-vars attribute value');
    return;
  }

  function setColors(colorObject, animate) {
    if (typeof gsap !== 'undefined' && animate) {
      gsap.to(htmlElement, {
        ...colorObject,
        duration: colorModeDuration,
        ease: colorModeEase,
      });
    } else {
      Object.keys(colorObject).forEach(function (key) {
        htmlElement.style.setProperty(key, colorObject[key]);
      });
    }
  }

  function goDark(dark, animate) {
    if (dark) {
      localStorage.setItem('dark-mode', 'true');
      htmlElement.classList.add('dark-mode');
      setColors(darkColors, animate);
      togglePressed = 'true';
    } else {
      localStorage.setItem('dark-mode', 'false');
      htmlElement.classList.remove('dark-mode');
      setColors(lightColors, animate);
      togglePressed = 'false';
    }
    if (typeof toggleEl !== 'undefined') {
      toggleEl.forEach(function (element) {
        element.setAttribute('aria-pressed', togglePressed);
      });
    }
  }

  // Remove system preference check
  let storagePreference = localStorage.getItem('dark-mode');
  if (storagePreference !== null) {
    storagePreference === 'true' ? goDark(true, false) : goDark(false, false);
  } else {
    // Set dark mode as default
    goDark(true, false);
  }

  window.addEventListener('DOMContentLoaded', (event) => {
    toggleEl = document.querySelectorAll('[tr-color-toggle]');
    toggleEl.forEach(function (element) {
      element.setAttribute('aria-label', 'View Light Mode'); // Changed label to reflect default dark mode
      element.setAttribute('role', 'button');
      element.setAttribute('aria-pressed', togglePressed);
    });
    toggleEl.forEach(function (element) {
      element.addEventListener('click', function () {
        let darkClass = htmlElement.classList.contains('dark-mode');
        darkClass ? goDark(false, true) : goDark(true, true);
      });
    });
  });
}
colorModeToggle();
