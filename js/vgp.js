/* ========== CENTRALIZING DYNAMIC PATH HANDLING FOR LOCAL AND GITHUB ========== */
const getBasePath = () => {
  const baseUri = new URL(document.baseURI);
  
  // Check if we're on GitHub Pages
  if (baseUri.hostname.includes('github.io')) {
    const pathParts = baseUri.pathname.split('/').filter(Boolean);
    // If there's at least one path segment, use the first as the base path
    if (pathParts.length > 0) {
      return `/${pathParts[0]}`; // https://ammopy.github.io/sui/sw.js >> /sui
    }
  }
  
  // For local development or other environments
  return '';
};

// Functions for problematic paths
const getSWPath = (file) => {
  return `${getBasePath()}/${file}`;
};

const getSWScope = () => {
  return `${getBasePath()}/`;
};

const getFFmpegPath = (base, file, version) => {
  return `${getBasePath()}/${base}/${file}?v=${version}`;
};


export { getSWPath, getSWScope, getFFmpegPath }