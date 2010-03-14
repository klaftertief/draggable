/*
 * DRAGGABLE PLUGIN
 * for Symphony
 *
 * This plugin is based on the Symphony orderable plugin written by Rowan Lewis
 *
 * @author: Nils Hörrmann, post@nilshoerrmann.de
 * @source: http://github.com/nilshoerrmann/draggable
 */


/*-----------------------------------------------------------------------------
	Draggable plugin
-----------------------------------------------------------------------------*/
	
	jQuery.fn.symphonyDraggable = function(custom_settings) {
		var objects = this;
		var settings = {
			items:				'li',			// What children do we use as items? 
			handles:			'*',			// What children do we use as handles? If set to false, items will be used as handles.
			click:				jQuery.noop(),	// Function to be executed on click.
			radius:				3,				// Click radius.
			distance:			10,				// Distance for dragging item out of the list.
			delay_initialize:	false
		};
		
		jQuery.extend(settings, custom_settings);
		
	/*-------------------------------------------------------------------------
		Draggable
	-------------------------------------------------------------------------*/
		
		objects = objects.map(function() {
			var object = this;
			var state = null;
			
			var start = function(item) {
				
				// Setup state
				state = {
					item: item,
					min: null,
					max: null,
					delta: 0,
					coordinate: event.pageY
				};

				// Add events
				jQuery(document).mousemove(change);
				jQuery(document).mouseup(stop);
				
				// Start dragging
				object.addClass('dragging');
				state.item.addClass('dragging');
				object.trigger('dragstart', [state.item]);
				
				return false;
			};
			
			var change = function(event) {
				var item = state.item;
				var target, next, top = event.pageY;
				var a = item.height();
				var b = item.offset().top;
				var prev = item.prev();
				
				state.min = Math.min(b, a + (prev.size() > 0 ? prev.offset().top : -Infinity));
				state.max = Math.max(a + b, b + (item.next().height() ||  Infinity));
				
				// Move up
				if(top < state.min) {
					target = item.prev(settings.items);
					
					while(true) {
						state.delta--;
						next = target.prev(settings.items);
						
						if(next.length === 0 || top >= (state.min -= next.height())) {
							item.insertBefore(target); break;
						}
						
						target = next;
					}
				}
				
				// Move down
				else if(top > state.max) {
					target = item.next(settings.items);
					
					while(true) {
						state.delta++;
						next = target.next(settings.items);
						
						if(next.length === 0 || top <= (state.max += next.height())) {
							item.insertAfter(target); break;
						}
						
						target = next;
					}
				}
				
				object.trigger('dragchange', [state.item]);
				
				return false;
			};
			
			var stop = function(event) {
				jQuery(document).unbind('mousemove', change);
				jQuery(document).unbind('mouseup', stop);
					
				if(state != null) {
	
					// Trigger click event
					if(state.coordinate - settings.radius < event.pageY && event.pageY < state.coordinate + settings.radius) {
						settings.click(state.item);
					}

					// Stop dragging
					object.removeClass('dragging');
					state.item.removeClass('dragging');
					object.trigger('dragstop', [state.item]);
					state = null;
				}
				
				return false;
			};
			
		/*-------------------------------------------------------------------*/
			
			if(object instanceof jQuery === false) {
				object = jQuery(object);
			}
			
			object.draggable = {
				
				initialize: function() {
					object.addClass('draggable');
					object.bind('mousedown', function(event) {				
						var current = jQuery(event.target);
						if(current.hasClass('destructor')) return;
						
						// Get handle
						if(settings.handles) {
							current.is(settings.handles);
						}
						else {
							current = current.parents(settings.items);
						}

						start(current);
					});

				}
				
			};
			
			if(settings.delay_initialize !== true) {
				object.draggable.initialize();
			}
			
			return object;
		});
		
		return objects;
	};
	
/*---------------------------------------------------------------------------*/
