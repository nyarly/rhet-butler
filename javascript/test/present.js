describe("Presentor", function(){
    var presenter
    var slideCount = 6;
    var itemCount = 5;

    function logStep(step){
      console.log("test", step.toString());
    }

    beforeEach(function(){
        document.body.innerHTML = __html__["javascript/test_support/test-presentation.html"];

        presenter = new rhetButler.Presenter(document, window);
        presenter.setup("test-presentation");
      })

    it("Should initialize a presenter", function(){
        expect(presenter).not.toBe(null);
      })

    describe("slide structure", function(){
        var presentation

        beforeEach(function() {
            presentation = presenter.rootStep
          });

        it('should iterate nextSlide correctly', function() {
            var step = presentation.firstSlide
            var slides = []

            while(step){
              slides.push(step)
              logStep(step)
              //console.log(step.toString());
              step = step.nextSlide
            }

            expect(slides.length).toBe(slideCount)
            expect(slides.every(function(slide){
                  return ( slide instanceof rhetButler.Slide )
                })).toBe(true)
          });

        it('should iterate prevSlide correctly', function() {
            var step = presentation.lastSlide
            var slides = []

            while(step){
              slides.push(step)
              logStep(step)
              //console.log(step.toString());
              step = step.prevSlide
            }

            expect(slides.length).toBe(slideCount)
            expect(slides.every(function(slide){
                  return ( slide instanceof rhetButler.Slide )
                })).toBe(true)
          });

        it('should iterate nextItem correctly', function() {
            var step = presentation.firstItem
            var items = []

            while(step){
              items.push(step)
              logStep(step)
              //console.log(step.toString());
              step = step.nextItem
            }

            expect(items.length).toBe(slideCount + itemCount)
            expect(items.every(function(item){
                  return ( item instanceof rhetButler.Slide || item instanceof rhetButler.Item)
                })).toBe(true)
          });

        it('should iterate prevItem correctly', function() {
            var step = presentation.lastItem
            var items = []

            while(step){
              items.push(step)
              logStep(step)
              //console.log(step.toString());
              step = step.prevItem
            }

            expect(items.length).toBe(slideCount + itemCount)
            expect(items.every(function(item){
                  return ( item instanceof rhetButler.Slide || item instanceof rhetButler.Item)
                })).toBe(true)
          });
      });
  });


//That steps tree is built properly when:
//  root:slide
//  root:group:slide
//  root:slide:item
//  root:group:group:slide
//  root:<something>:group:<something>:slide
//  slide:item
// and various sequencing of same
//
//
//That we traverse steps properly when goto()
//  Install event listeners that collect all the elements as they're passed
//  Check sequence of elements
//
//  Make sure we don't proceed when a long transition/animation is happening:
//    set up motion that takes e.g. 30sec - confirm that we see the step it
//    starts on as am-at and not the next one for 10ms
//
//
//Various goto() calls produce the right kinds of motion
//  jumping
//  stepping
//  forward
//  reverse
//
//Interrupted transitions behave correctly
//  Set motion classes properly
//  Set previous/next properly
//  Set next_id/prev_id class on root
//
//
//Hash fragments work properly
//  Set current slide immediately
//
//Bounce fragments work properly
//  stub the goto() to check that it's called properly.
//
//(If AJAX: sinon Ajax comes *after* fixtures)
