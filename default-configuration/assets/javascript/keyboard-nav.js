
//Gratefully adapted from impress.js
function setupUserInterface(api) {
  // KEYBOARD NAVIGATION HANDLERS
  //
  function prevItem() {
    return api.moveTo("previous", "item")
  }

  function nextItem() {
    return api.moveTo("next", "item")
  }

  function prevSlide() {
    return api.moveTo("previous", "slide")
  }

  function nextSlide() {
    return api.moveTo("next", "slide")
  }

  //KeyboardEvent{ altKey, ctrlKey, shiftKey, keyCode }
  var keys = {
    33: prevItem, //pg up
    38: prevItem, //up
    75: prevItem, //k

    32: nextItem, //space
    34: nextItem, //pg down
    40: nextItem, //down
    74: nextItem, //j

    37: prevSlide, //left
    72: prevSlide, //h

    9:  nextSlide, //tab
    39: nextSlide, //right
    76: nextSlide, //l
    13: nextSlide, //return
  }

  var activeCodes = []
  for( code in keys ){
    activeCodes.push(parseInt(code))
  }

  // Prevent default keydown action when one of supported key is pressed.
  document.addEventListener("keydown", function ( event ) {
      if ( activeCodes.some(function(code){ return code == event.keyCode } )) {
        event.preventDefault();
      }
    }, false);

  // Trigger impress action (next or prev) on keyup.
  document.addEventListener("keyup", function ( event ) {
      if( activeCodes.some(function(code){return code == event.keyCode})) {
        keys[event.keyCode.toString()]()
        event.preventDefault();
      }
    }, false);

  // touch handler to detect taps on the left and right side of the screen
  // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
  document.addEventListener("touchstart", function ( event ) {
      if (event.touches.length === 1) {
        var x = event.touches[0].clientX,
        y = event.touches[0].clientY,
        width = window.innerWidth * 0.3,
        height = window.innerHeight * 0.3
        result = null;

        if ( x < width ) {
          if ( y < height ) {
            result = prevSlide();
          } else {
            result = prevItem();
          }
        } else if ( x > window.innerWidth - width ) {
          if ( y < height ) {
            result = nextSlide();
          } else {
            result = nextItem();
          }
        }

        if (result) {
          event.preventDefault();
        }
      }
    }, false);
}
