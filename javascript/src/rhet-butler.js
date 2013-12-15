goog.provide('rhetButler');
(function(){
    var utils = rhetButler;

    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    utils.arrayify = function ( a ) {
        return [].slice.call( a );
    };

    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    utils.$$ = function ( selector, context ) {
      context = context || document;
      return this.arrayify( context.querySelectorAll(selector) );
    };

    // `byId` returns element with given `id` - you probably have guessed that ;)
    utils.byId = function ( id ) {
      return document.getElementById(id);
    };

    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    utils.triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    var prefixes = ['Webkit', 'webkit', 'moz', 'Moz', 'o', 'O', 'ms', 'khtml', 'Khtml'];

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    utils.pfx = (function () {
        var style = window.getComputedStyle(document.createElement('dummy')),
            memory = {};

            return function ( prop ) {
              if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp, props;
                ucProp  = prop.replace(/-[a-z]/g, function(match){ return match.slice(-1)[0].toUpperCase(); }),
                props = [prop, ucProp];
                ucProp = ucProp.replace(/^[a-z]/, function(letter){ return letter.toUpperCase() });
                var allPfx = prefixes.forEach(function(prefix){
                    props.push(prefix + prop);
                    props.push(prefix + ucProp);
                    props.push(prefix + "-" + prop);
                    props.push(prefix + "-" + ucProp);
                    props.push("-" + prefix + "-" + prop);
                    props.push("-" + prefix + "-" + ucProp);
                  });

                props = props.concat(allPfx);

                memory[ prop ] = null;
                for ( var i in props ) {
                  var testValue = style.getPropertyValue(props[i]);
                  if (!(testValue === null || testValue === undefined) ) {
                    memory[ prop ] = props[i];
                    break;
                  }
                }

              }

              return memory[ prop ];
            };
          })();
      })();
