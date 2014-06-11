go.paginated_extension = function() {
	var vumigo = require('vumigo_v02');
	var _ = require('lodash');
	var Choice = vumigo.states.Choice;
	var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;

	var MenuChoiceState = PaginatedChoiceState.extend(function(self, name, opts) {
		PaginatedChoiceState.call(self, name, opts);
		
		var current_choices = self.current_choices;

		self.current_choices = function() {
			var choices = current_choices();
			var index = _.findIndex(choices, function(choice) {
				return choice.value === '__more__' || choice.value === '__back__';
			});

			choices.splice(index, 0, new Choice('states:start', 'Menu'));

			return choices;
		};
	});

	return {
		MenuChoiceState: MenuChoiceState
	};
}();