# Rhet Butler

A presentation app for developers and other tech people. Inspired by Showoff
and its "might could dos."

# Features

Slides are formatted as YAML.

Slides are styled with CSS (or CSS generating languages supported by Tilt)

A slick animation-handling presentation runner in pure Javascript.

Offline operation.  I can never get wifi in a crowded tech presentation.

Split presenter/viewer modes, with hidden notes and next slide.

Smartphone presentation support over wifi.

Cascading configuration, so you can reuse slides, images, layouts, etc, without
having to keep copying everything everywhere. All your presentations should
start and end roughly the same way, so why repeat yourself? Also, obviously you
need a shared directory called cats/

# How do I use it?

Start by

    gem install rhet-butler

This is one of the rare gems that's actually intended to be used as a command
line utility, so it really helps to install it system-wide.  (Or at least in
your user gem path.)

<A miracle occurs where you write a presentation in YAML.>

Run

    rhet-butler serve

You'll see some possible URLs for the presentation - pick one that seems
appropriate and plug it into your browser. There's a setup page with
instructions from there.

# Building Presentations

In other words "the miracle occurs."  There's three concepts around how Rhet Butler handles presentations:

Slides, styling, file loading.

# Slides

We take great advantage of the YAML format - it really is very nice, and you'll
do yourself a favor becoming more familiar.

While you're working on a presentation, you can use

    rhet-butler author

which will reload all files whenever you reload the browser, so you can check your changes.

Rhet will do its best to output useful error messages if you vary from correct YAML formatting.

There's a few custom YAML tags that rhet-butler slides use:

```yaml
!slide
  content:
  notes:

!group
  slides:
```

For a more complete reference for the special tags you can use in your slides, see [FORMAT](FORMAT.md).

Rhet-Butler leans hard on the YAML format, c.f. [YAML](http://yaml.org/YAML_for_ruby.html) or this [YAML cheatsheet](http://www.yaml.org/refcard.html).

# Future work

See the [TODO](TODO) list.

# FAQ

Q. Why is it named after a character in Gone Wind the Wind?
A. It's not.  It's a helper for your speeches.  A rhetoric butler.  From there,
it's a *pun* on the name of a character in Gone With the Wind.

Q. Why a pun?
A. I should think that would be obvious.  Puns are awesome.

# Is it any good?

Yes.

# Many Thanks

- Scott Chacon - wrote Showoff, the original inspiration
- Bartek Szopka - author of impress.js which inspired the JS presentation system
- Ryan Tomayko - for Tilt, the excellent templating plugin system
- Ivan Sagalaev - author of highlight.js, used for code highlighting
- Google Fonts
