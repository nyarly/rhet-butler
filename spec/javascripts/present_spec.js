describe("Presentor", function(){
    var presenter
    var slideCount = 6;
    var itemCount = 5;

    function logStep(step){
      //console.log("test", step.toString());
    }

    beforeEach(function(){
        loadFixtures("test-presentation.html");

        presenter = new rhetButler.Presenter(document, window);
        presenter.setup("test-presentation");
      })

    it("Should initialize a presenter", function(){
        expect(presenter).not.toBe(null);
      })

    function stableState(rootStep) {
      rootStep.eachStep(function(step){
          expect(step.hasClass("am-at")).toBeFalsy();
          expect(step.hasClass("to-come")).toBeFalsy();
          expect(step.hasClass("has-gone")).toBeFalsy();
        });
    };

    describe("slide structure", function(){
        var presentation

        beforeEach(function() {
            presentation = presenter.rootStep
          });

        function countRefs(refName, nullsExpected){
          var nullCount = 0;
          var stepCount = 0;
          presentation.eachStep(function(step){
              if((step instanceof rhetButler.Steps.Slide ||
                  step instanceof rhetButler.Steps.Item)){
                stepCount++;
                if( step[refName] === null ) {
                  nullCount++;
                }
              }
            });

          expect(stepCount).toBe(slideCount + itemCount);
          expect(nullCount).toBe(nullsExpected);
        };

        it("should be in a stable state", function() {
            stableState(presentation);
          });

        it('should all have the "future" class', function() {
            presentation.eachStep(function(step){
                if(step.element.id != "slide-1"){
                  expect([step.element.id, step.hasClass("future")]).toEqual([step.element.id, true])
                } else {
                  expect([step.element.id, "present", step.hasClass("present")]).toEqual([step.element.id, "present", true])
                  expect([step.element.id, "past", step.hasClass("past")]).not.toEqual([step.element.id, "past", true])
                }
              });
          });

        it('should have only one null prevItem', function() {
            countRefs("prevItem", 1);
          });

        it('should have only one null prevSlide', function() {
            countRefs("prevSlide", 1);
          });

        it('should have only one null nextItem', function() {
            countRefs("nextItem", 1);
          });

        it('should have only one null nextSlide', function() {
            countRefs("nextSlide", 2);
          });

        it('should iterate nextSlide correctly', function() {
            var step = presentation.firstSlide
            var slides = []

            while(step){
              slides.push(step)
              logStep(step)
              step = step.nextSlide
            }

            expect(slides.length).toBe(slideCount)
            expect(slides.every(function(slide){
                  return ( slide instanceof rhetButler.Steps.Slide )
                })).toBe(true)
          });

        it('should iterate prevSlide correctly', function() {
            var step = presentation.lastSlide
            var slides = []

            while(step){
              slides.push(step)
              logStep(step)
              step = step.prevSlide
            }

            expect(slides.length).toBe(slideCount)
            expect(slides.every(function(slide){
                  return ( slide instanceof rhetButler.Steps.Slide )
                })).toBe(true)
          });

        it('should iterate nextItem correctly', function() {
            var step = presentation.firstItem
            var items = []

            while(step){
              items.push(step)
              logStep(step)
              step = step.nextItem
            }

            expect(items.length).toBe(slideCount + itemCount)
            expect(items.every(function(item){
                  return ( item instanceof rhetButler.Steps.Slide ||
                    item instanceof rhetButler.Steps.Item)
                })).toBe(true)
          });

        it('should iterate prevItem correctly', function() {
            var step = presentation.lastItem
            var items = []

            while(step){
              items.push(step)
              logStep(step)
              step = step.prevItem
            }

            expect(items.length).toBe(slideCount + itemCount)
            expect(items.every(function(item){
                  return ( item instanceof rhetButler.Steps.Slide ||
                    item instanceof rhetButler.Steps.Item)
                })).toBe(true)
          });

        it("should sequence cues correctly", function() {
            var slide = presenter.resolveStep("item-1").parent;
            var cues = slide.children.map(function(item){return item.cue();});

            expect(cues).toEqual(["cue-1", "cue-2", "cue-10"]);
          });
      });

    describe("slide changes", function(){
        var startStep;

        beforeEach(function(){
            presenter.teleport("item-3");
            startStep = presenter.currentStep();
          });

        it('should advance a slide', function() {
            presenter.moveTo('next', 'slide');
          });

        it('should advance by an item', function() {
            presenter.moveTo('next', 'item');
          });

        it('should reverse by a slide', function() {
            presenter.moveTo('previous', 'slide');
          });

        it('should reverse by an item', function() {
            presenter.moveTo('previous', 'item');
          });
      });

    describe('slide resolution', function() {
        it('should find a slide by id', function() {
            var step = presenter.resolveStep("slide-1");
            expect(step.element.id).toBe("slide-1");
        });

        it('should find an item by id', function() {
            var step = presenter.resolveStep("item-3");
            expect(step.element.id).toBe("item-3");
        });

    });

    describe("transitionList", function(){
        var list;
        var startStep, endStep;

        beforeEach(function(){
            startStep = presenter.resolveStep("slide-1");
            endStep = presenter.resolveStep("slide-5");
            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.elementArrived = function(){};
          });

        it('begin in preparing state', function() {
            expect(presenter.rootStep.hasClass("preparing")).toBe(true);
          });

        it('being not in "uphill" state', function() {
            expect(presenter.rootStep.hasClass("uphill")).toBe(false);
          });

        it('being not in "downhill" state', function() {
            expect(presenter.rootStep.hasClass("downhill")).toBe(false);
          });

        it('being not in "arrived" state', function() {
            expect(presenter.rootStep.hasClass("arrived")).toBe(false);
          });

        it('start with the start step', function() {
            expect(list.uphill[0].step == startStep).toBe(true);
          });

        it('finish with the end step', function() {
            expect(list.downhill.slice(-1)[0].step == endStep).toBe(true);
          });

        describe('started', function() {
            beforeEach(function() {
                list.start();
              });

            it('not be in preparing state', function() {
                expect(presenter.rootStep.hasClass("preparing")).toBe(false);
              });

            it('be in "uphill" state', function() {
                expect(presenter.rootStep.hasClass("uphill")).toBe(true);
              });

            it('not be in "downhill" state', function() {
                expect(presenter.rootStep.hasClass("downhill")).toBe(false);
              });

            it('not be in "arrived" state', function() {
                expect(presenter.rootStep.hasClass("arrived")).toBe(false);
              });

            it('proceed through stations smoothly', function() {
                var count = 0;
                while(list.nextStation()){
                  expect(presenter.rootStep.hasClass("arrived")).toBe(false);
                  count++;
                  expect(count).toBeLessThan(20);
                }
                expect(presenter.rootStep.hasClass("arrived")).toBe(true);
                expect(count).toBe(5);
              });


//                  list.eachStation(function(station){
//                      if(station.step != list.currentStep){
//                        expect(station.step.hasClass("am-at")).toBe(false);
//                      }
//                    });
//                  expect(list.currentStep.hasClass("am-at")).toBe(true);
          });

      });


    //XXX going previous from first step sets "cancelled" on root, and following nextSlide *doesn't* unset "present" from first slide
    //XXX going next from last step likewise

    describe('advance by slide', function() {
        var rootStep;
        var list;
        var startStep, endStep;

        beforeEach(function(){
            rootStep = presenter.rootStep;

            startStep = presenter.resolveStep("slide-2");
            endStep = startStep.nextSlide;
            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.changeState("uphill");
          });

        it("should set 'by-slide' class", function() { expect(rootStep.hasClass("by-slide")).toBeTruthy(); })
        it('should set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(true) });
        it('should set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(true) });
        it('should set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(true) });

        it('should not set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(false) });
        it('should not set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(false) });

        it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });
        describe('after completing transition', function() {
            beforeEach(function() {
                list.elementArrived();
              });

            //XXX Only end step should be current
            //
            it('should set "past" on start step', function() { expect(startStep.hasClass("past")).toBe(true); });

            it('should not set "present" on start step', function() { expect(startStep.hasClass("present")).toBe(false); });
            it('should not set "future" on start step', function() { expect(startStep.hasClass("future")).toBe(false); });

            it('should set "present" on end step', function() { expect(endStep.hasClass("present")).toBe(true); });

            it('should not set "past" on end step', function() { expect(endStep.hasClass("past")).toBe(false); });
            it('should not set "future" on end step', function() { expect(endStep.hasClass("future")).toBe(false); });

            it('should not set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(false) });
            it('should not set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(false) });
            it('should not set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(false) });
            it('should not set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(false) });
            it('should not set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(false) });

            it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });

        });
      });

    describe("moveTo previous from first", function(){
        var rootStep;

        beforeEach(function() {
            rootStep = presenter.rootStep;
            presenter.moveTo("slide-1");
            expect(presenter.currentStep().element.id).toEqual("slide-1");
            presenter.moveTo("previous", "slide")
          });

        it("should be arrived", function() { expect(rootStep.hasClass("arrived")).toBeTruthy(); });
        it("should not be cancelled", function() { expect(rootStep.hasClass("cancelled")).toBeFalsy(); });
      });

    describe("moveTo next", function() {
        var rootStep, endStep;

        beforeEach(function() {
            rootStep = presenter.rootStep;
            endStep = presenter.resolveStep("next", "slide");
            presenter.moveTo("next", "slide");
          });

        it("should set a hash fragment", function() {
            expect(window.location.hash).toMatch("#/" + endStep.element.id);
          });

        it("should only set current on the current step", function() {
            rootStep.eachStep(function(step){
                if(step == endStep){
                  expect(step.hasClass("current")).toBeTruthy();
                } else {
                  expect(step.hasClass("current")).toBeFalsy();
                }
              })
          });

      });

    describe("jump if hash fragment is changed", function() {
        beforeEach(function() {
            window.location.hash = "#/item-4";
          });

        it("should go to target", function() {
            waitsFor(function(){ return presenter.currentStep().element.id == "item-4"; }, "arrived at item-4", 200);
          });
      });

    describe('advance by item', function() {
        var parentSlide;
        var fromCue, toCue;

        beforeEach(function(){
            rootStep = presenter.rootStep;

            startStep = presenter.resolveStep("item-1");
            parentSlide = startStep.parent; // === presenter.resolveStep("slide-2")
            fromCue = startStep.cue();

            endStep = startStep.nextItem;
            toCue = endStep.cue();

            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.changeState("uphill");
          });

        it("should set 'by-item' class", function() { expect(rootStep.hasClass("by-item")).toBeTruthy(); });
        it('should set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(true) });
        it('should set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(true) });
        it('should set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(true) });

        it("should not set 'by-slide' class", function() { expect(rootStep.hasClass("by-slide")).toBeFalsy(); })
        it('should not set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(false) });
        it('should not set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(false) });
        it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });

        it("should go from cue-1 to cue-2", function() {
            expect(fromCue).toBe("cue-1");
            expect(toCue).toBe("cue-2");
          });

        it("should set prev-cue-1", function() { expect(parentSlide.hasClass("prev-cue-1")).toBeTruthy(); });
        it("should set next-cue-2", function() { expect(parentSlide.hasClass("next-cue-2")).toBeTruthy(); });
        it("should not set current-cue", function() {
            expect(parentSlide.hasClass("current-cue-1")).toBeFalsy();
            expect(parentSlide.hasClass("current-cue-2")).toBeFalsy();
          });

        describe('on complete', function() {
            beforeEach(function() {
                list.elementArrived();
              });

            //XXX parent slide should be present

            it("should set current on parentSlide", function() { expect(parentSlide.hasClass("current")).toBeTruthy(); });
            it("should set present on parentSlide", function() { expect(parentSlide.hasClass("present")).toBeTruthy(); });

            it("should set current-cue-2", function() { expect(parentSlide.hasClass("current-cue-2")).toBeTruthy(); });

            it("should not set prev-cue-1", function() { expect(parentSlide.hasClass("prev-cue-1")).toBeFalsy(); });
            it("should not set next-cue-2", function() { expect(parentSlide.hasClass("next-cue-2")).toBeFalsy(); });
            it("should not set current-cue-1", function() { expect(parentSlide.hasClass("current-cue-1")).toBeFalsy(); });
          });
      });

    describe('rewind by slide', function() {
        beforeEach(function(){
            rootStep = presenter.rootStep;

            startStep = presenter.resolveStep("slide-3");
            endStep = startStep.prevSlide;
            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.changeState("uphill");
          });

        it("should set 'by-slide' class", function() { expect(rootStep.hasClass("by-slide")).toBeTruthy(); })
        it('should set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(true) });
        it('should set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(true) });
        it('should set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(true) });

        it('should not set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(false) });
        it('should not set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(false) });
        it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });
      });

    describe('jump forward', function() {
        beforeEach(function(){
            rootStep = presenter.rootStep;

            startStep = presenter.resolveStep("slide-1");
            endStep = presenter.resolveStep("slide-5");
            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.changeState("uphill");
          });

        it("should set 'by-slide' class", function() { expect(rootStep.hasClass("by-slide")).toBeTruthy(); })
        it('should set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(true) });
        it('should set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(true) });
        it('should set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(true) });

        it('should not set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(false) });
        it('should not set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(false) });

        it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });
      });

    if(/phantom/i.test(window.navigator.userAgent)) {
      console.log("NOTA MOLTO BENE: Skipping transition & animation related tests which PhantomJS doesn't support")
    } else {
      describe('moveTo slide past animation', function(){
          var startStep, endStep;

          beforeEach(function() {
              var transitioning;
              loadFixtures("long-animation-group-1.html", "test-presentation.html");

              presenter = new rhetButler.Presenter(document, window);
              presenter.setup("test-presentation");

              startStep = presenter.resolveStep("slide-2");
              endStep = presenter.resolveStep("slide-5");
              transitioning = presenter.resolveStep("group-1");

              presenter.teleport("slide-2");
              presenter.moveTo("slide-5");
            });

          it("should be at animated step", function() {
              expect(presenter.currentStep().element.id).toEqual("group-1");
            });


          describe("and continue onto next slide", function() {
              var rootStep;
              beforeEach(function() {
                  rootStep = presenter.rootStep;
                  presenter.moveTo("next", "slide");
                });

              it("should should arrive at next slide", function() {
                  expect(presenter.currentStep().element.id).toEqual("slide-6");
                });

              it("should set 'arrived' on root", function() { expect(rootStep.hasClass("arrived")).toBeTruthy(); });


              it("should not set am-at anywhere", function() {
                  rootStep.eachStep(function(step){
                      expect([step.toString(), step.hasClass("am-at")]).toEqual([step.toString(), false]);
                    });
                });

              it("should not set to-come anywhere", function() {
                  rootStep.eachStep(function(step){
                      expect([step.toString(), step.hasClass("to-come")]).toEqual([step.toString(), false]);
                    });
                });

              it("should not set has-gone anywhere", function() {
                  rootStep.eachStep(function(step){
                      expect([step.toString(), step.hasClass("has-gone")]).toEqual([step.toString(), false]);
                    });
                });

              it('should set "past" on start step', function() { expect(startStep.hasClass("past")).toBe(true); });

              it('should not set "present" on start step', function() { expect(startStep.hasClass("present")).toBe(false); });
              it('should not set "future" on start step', function() { expect(startStep.hasClass("future")).toBe(false); });

              it('should not set "present" on end step', function() { expect(endStep.hasClass("present")).toBe(false); });
              it('should not set "past" on end step', function() { expect(endStep.hasClass("past")).toBe(false); });
              it('should set "future" on end step', function() { expect(endStep.hasClass("future")).toBe(true); });

              it('should not set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(false) });
              it('should not set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(false) });
              it('should not set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(false) });
              it('should not set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(false) });
              it('should not set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(false) });

              it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });

            });
        });

      describe('jump forward - animation classes', function() {
          var transitioning;
          beforeEach(function(){
              loadFixtures("long-animation-group-1.html", "test-presentation.html");

              presenter = new rhetButler.Presenter(document, window);
              presenter.setup("test-presentation");

              transitioning = presenter.resolveStep("group-1");
              rootStep = presenter.rootStep;

              startStep = presenter.resolveStep("slide-2");
              endStep = presenter.resolveStep("slide-5");
              list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
              list.start()
            });

          it("should set moving on root", function() {
              expect(rootStep.hasClass("moving")).toBeTruthy();
            });


          describe("the element with a transition", function() {
              var groupOne;

              beforeEach(function() {
                  groupOne = document.getElementById("group-1")
                });

              it("should have am-at", function() { expect(groupOne.classList.contains("am-at")).toBeTruthy(); });
              it("should not have has-gone", function() { expect(groupOne.classList.contains("has-gone")).toBeFalsy(); });
              it("should not have to-come", function() { expect(groupOne.classList.contains("to-come")).toBeFalsy(); });
            });
        });

      describe('jump forward - looped animation classes', function() {
          var transitioning;
          beforeEach(function(){
              loadFixtures("looped-animation-group-1.html", "test-presentation.html");

              presenter = new rhetButler.Presenter(document, window);
              presenter.setup("test-presentation");

              transitioning = presenter.resolveStep("group-1");
              rootStep = presenter.rootStep;

              startStep = presenter.resolveStep("slide-2");
              endStep = presenter.resolveStep("slide-5");
              list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
              list.start()
            });

          it("should set arrived on root", function() {
              expect(rootStep.hasClass("arrived")).toBeTruthy();
            });

        });

      describe('jump forward - transition classes', function() {
          var transitioning;
          beforeEach(function(){
              loadFixtures("long-transition-group-1.html", "test-presentation.html");

              presenter = new rhetButler.Presenter(document, window);
              presenter.setup("test-presentation");

              transitioning = presenter.resolveStep("group-1");
              rootStep = presenter.rootStep;

              startStep = presenter.resolveStep("slide-2");
              endStep = presenter.resolveStep("slide-5");
              list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
              list.start()
            });

          it("should set moving on root", function() {
              expect(rootStep.hasClass("moving")).toBeTruthy();
            });


          describe("the element with a transition", function() {
              var groupOne;

              beforeEach(function() {
                  groupOne = document.getElementById("group-1")
                });

              it("should have am-at", function() { expect(groupOne.classList.contains("am-at")).toBeTruthy(); });
              it("should not have has-gone", function() { expect(groupOne.classList.contains("has-gone")).toBeFalsy(); });
              it("should not have to-come", function() { expect(groupOne.classList.contains("to-come")).toBeFalsy(); });
            });

        });
    }

    //slide
    //item
    describe('jump backward', function() {
        beforeEach(function(){
            rootStep = presenter.rootStep;

            startStep = presenter.resolveStep("slide-5");
            endStep = presenter.resolveStep("slide-1");
            list = new rhetButler.TransitionStations(presenter, startStep, startStep, endStep);
            list.changeState("uphill");
          });

        it("should set 'by-slide' class", function() { expect(rootStep.hasClass("by-slide")).toBeTruthy(); })
        it('should set "moving" class', function() { expect(rootStep.hasClass("moving")).toBe(true) });
        it('should set "jump" class', function() { expect(rootStep.hasClass("jump")).toBe(true) });
        it('should set "backwards" class', function() { expect(rootStep.hasClass("backwards")).toBe(true) });

        it("should not set 'by-item' class", function() { expect(rootStep.hasClass('by-item')).toBeFalsy(); });
        it('should not set "advance" class', function() { expect(rootStep.hasClass("advance")).toBe(false) });
        it('should not set "forwards" class', function() { expect(rootStep.hasClass("forwards")).toBe(false) });

        it("should not set 'undefined' class", function() { expect(rootStep.hasClass("undefined")).toBeFalsy(); });
      });
});

//Interrupted transitions behave correctly
//  Set motion classes properly
//  Set previous/next properly
//  Set next_id/prev_id class on root
//
//Bounce fragments work properly
//  stub the moveTo() to check that it's called properly.
//
//(If AJAX: sinon Ajax comes *after* fixtures)
