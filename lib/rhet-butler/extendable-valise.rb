module RhetButler
  module ExtendableValise
    def reset_overlay
      @extra_valise = Valise::Set.new
    end

    def extend_search(role_path = nil, &block)
      definer =
        if role_path.nil?
          Valise::Set::Definer.new(@extra_valise)
        else
          Valise::Set::StemmedDefiner.new(role_path, @extra_valise)
        end
      definer.instance_eval(&block)
    end

    def valise(role_path = nil)
      if role_path.nil?
        (@extra_valise + @base_valise)
      else
        (@extra_valise + @base_valise).sub_set(role_path)
      end
    end
  end
end
