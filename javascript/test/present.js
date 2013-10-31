
describe("Presentation Structure", function(){
    var presenter

    beforeEach(function(){
        document.body.innerHTML = __html__["javascript/test_support/test-presentation.html"];

        presenter = new rhetButler.Presenter(document, window);
      })

    it("Should initialize a presenter", function(){
        expect(presenter).not.toBe(null);
      })
})


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
