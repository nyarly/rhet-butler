require 'sass'
require 'sass/script/functions'

module Sass::Script
  module Functions
    def exp(modulus, exponent)
      assert_type modulus, :Number
      assert_type exponent, :Number

      Number.new(modulus.value ** exponent.value, modulus.numerator_units, modulus.denominator_units)
    end
    declare :exp, :args => [:modulus, :exponent]

    def tween(initial, final, ratio)
      assert_type initial, :Number
      assert_type final, :Number
      assert_type ratio, :Number

      initial_units = [initial.numerator_units, initial.denominator_units]
      final_units = [final.numerator_units, final.denominator_units]
      unless initial_units == final_units
        raise ArgumentError, "Mismatched units: initial: #{initial_units.inspect} != final: #{final_units.inspect}"
      end

      ratio_units = ratio.numerator_units - ratio.denominator_units
      ratio_value = case ratio_units
                    when %w{%}
                      ratio.value / 100.0
                    when []
                      ratio.value
                    else
                      raise ArgumentError, "Bad units for ratio: #{ratio_units.inspect}"
                    end

      Number.new(initial.value + ((final.value - initial.value) * ratio_value), *initial_units)
    end

    declare :tween, :args => [:initial, :final, :ratio]
  end
end
