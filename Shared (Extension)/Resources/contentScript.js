// contentScript.js

console.log('Content script loaded.');

// Check if running in the top-level window
if (window.top !== window.self) {
  // We are in an iframe; do not execute the script
  console.log('Content script is running inside an iframe, exiting.');
  // Exit the script
//  return;
}

function removeAutoplayAndNextEpisode() {
  console.log('Removing autoplay and "Next Episode" features.');

  // Function to hide "Next Episode" button
  function hideNextEpisodeButton() {
    // Select the button using the data-uia attribute
    const nextEpisodeButton = document.querySelector('button[data-uia="next-episode-seamless-button"]');
    if (nextEpisodeButton) {
      nextEpisodeButton.style.display = 'none';
      console.log('"Next Episode" button hidden.');
    } else {
      console.log('"Next Episode" button not found.');
    }
  }

  // Function to disable autoplay
  function disableAutoplay() {
    const skipButton = document.querySelector('.skip-credits');
    if (skipButton) {
      skipButton.style.display = 'none';
      console.log('"Skip Credits" button hidden.');
    }

    const videoPlayer = document.querySelector('video');
    if (videoPlayer) {
      videoPlayer.autoplay = false;
      videoPlayer.removeAttribute('autoplay');
      console.log('Autoplay disabled on video player.');
    }
  }

  // Initial execution
  hideNextEpisodeButton();
  disableAutoplay();

  // Observe for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hideNextEpisodeButton();
        disableAutoplay();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('Mutation observer set up to monitor DOM changes.');
}

// Run the function when the content script is loaded
removeAutoplayAndNextEpisode();
