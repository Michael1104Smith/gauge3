function Gauge(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this; // for internal d3 functions
	
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.config.size = this.config.size * 0.9;
		
		this.config.raduis = this.config.size * 0.97 / 2;
		this.config.cx = this.config.size / 2;
		this.config.cy = this.config.size / 2;
		
		this.config.min = undefined != configuration.min ? configuration.min : 0; 
		this.config.max = undefined != configuration.max ? configuration.max : 100; 
		this.config.range = this.config.max - this.config.min;
		
		this.config.majorTicks = configuration.majorTicks || 5;
		this.config.minorTicks = configuration.minorTicks || 2;
		
		this.config.valueFontSize = configuration.valueFontSize || 25;
		
		this.config.transitionDuration = configuration.transitionDuration || 500;
	}

	this.render = function()
	{
		var chartId = "#" + this.placeholderName;
		$(chartId).html("");
		this.body = d3.select("#" + this.placeholderName)
							.append("svg:svg")
							.attr("class", "gauge")
							.attr("width", this.config.size)
							.attr("height", this.config.size);
		
		var fontSize = Math.round(this.config.size / 16);
		var minorDelta = this.config.range / (this.config.majorTicks - 1);
		var first_flag = 0;
		for (var minor = this.config.min; minor <= this.config.max; minor += minorDelta)
		{
				var point1 = this.valueToPoint(minor, 0.63, 258, 37);
				var point2 = this.valueToPoint(minor, 0.83, 258, 37);
				
				var delta_y = point1.y - point2.y;
				var delta_x = point1.x - point2.x;
				var rotate_value = Math.atan(delta_y/delta_x)/Math.PI*180 - 90;
				if(minor > (this.config.min + this.config.max)/2 - 1){
					rotate_value = Math.atan(delta_y/delta_x)/Math.PI*180 + 90;
				}
				var pos_x = (point1.x + point2.x) /2;
				var pos_y = (point1.y + point2.y) /2;

				if(first_flag == 0){
					if(this.config.min>9){
						pos_x += 4;
						pos_y += 6;
					}else if(this.config.min>4){
						pos_x += 1;
						pos_y += 2;
					}
					first_flag = 1;
				}

				var value_fontsize = fontSize/3*2;

				var cur_text = Math.round(minor);
				this.body.append("text")
				 			.attr("dy", value_fontsize / 3)
				 			.attr("text-anchor", minor == this.config.min ? "start" : "end")
				 			.text(cur_text)
				 			.attr("transform","translate("+pos_x+","+pos_y+") rotate("+rotate_value+")")
				 			.style("font-size", value_fontsize + "px")
							.style("fill", "#ffffff")
							.style("stroke-width", "0px");
		}
		
		var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");
		
		var midValue = (this.config.min + this.config.max) / 2;

		var pointerPath = this.buildPointerPath(midValue);
		
		var pointerLine = d3.svg.line()
									.x(function(d) { return d.x })
									.y(function(d) { return d.y })
									.interpolate("basis");;

		pointerContainer.append("svg:circle")
							.attr("cx", this.config.cx)
							.attr("cy", this.config.cy)
							.attr("r", 0.4 * this.config.raduis)
							.style("fill", "#4d4948")
							.style("stroke", "#1f1a17")
							.style("opacity", 1);

		pointerContainer.append("svg:circle")
							.attr("cx", this.config.cx)
							.attr("cy", this.config.cy)
							.attr("r", 0.2 * this.config.raduis)
							.style("fill", "#c2c1c1")
							.style("stroke", "#1f1a17")
							.style("opacity", 1);

		
		pointerContainer.append("svg:path")
							.data([pointerPath])
									.attr("d", pointerLine)
									.style("fill", "#ffffff")
									.style("fill-opacity", 1);

		pointerContainer.append("svg:circle")
							.attr("cx", this.config.cx)
							.attr("cy", this.config.cy)
							.attr("r", 0.03 * this.config.raduis)
							.style("fill", "#383431")
							.style("opacity", 1);

		var fontSize = this.config.valueFontSize;
		pointerContainer.selectAll("text")
							.data([midValue])
							.enter()
								.append("svg:text")
									.attr("x", this.config.cx)
									.attr("y", this.config.size - this.config.cy / 4 - fontSize)
									.attr("dy", fontSize / 2)
									.attr("text-anchor", "middle")
									.style("font-size", fontSize + "px")
									.style("fill", "#000")
									.style("stroke-width", "0px");
		
		this.redraw(this.config.min, 0);
	}
	
	this.buildPointerPath = function(value)
	{
		var delta = this.config.range / 13;
		
		var head = valueToPoint(value, 0.7, 270, 45);
		var head1 = valueToPoint(value - delta, 0.12, 270, 45);
		var head2 = valueToPoint(value + delta, 0.12, 270, 45);
		
		var tailValue = value - (this.config.range * (1/(270/360)) / 2);
		var tail = valueToPoint(tailValue, 0.12, 270, 45);
		var tail1 = valueToPoint(tailValue - delta*2, 0.1, 270, 45);
		var tail2 = valueToPoint(tailValue + delta*2, 0.1, 270, 45);
		
		return [head, head1, tail2, tail, tail1, head2, head];
		
		function valueToPoint(value, factor, value1, value2)
		{
			var point = self.valueToPoint(value, factor, value1, value2);
			point.x -= self.config.cx;
			point.y -= self.config.cy;
			return point;
		}
	}
	
	this.redraw = function(value, transitionDuration)
	{
		var pointerContainer = this.body.select(".pointerContainer");
		
		pointerContainer.selectAll("text").text(value);
		
		var pointer = pointerContainer.selectAll("path");
		pointer.transition()
					.duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
					//.delay(0)
					//.ease("linear")
					//.attr("transform", function(d) 
					.attrTween("transform", function()
					{
						var pointerValue = value;
						if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
						else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
						var targetRotation = (self.valueToDegrees(pointerValue, 254, 37) - 90);
						if(value < (self.config.max + self.config.min)/2){
							targetRotation = (self.valueToDegrees(pointerValue, 254, 39) - 90);
						}
						if(value == self.config.min){
							targetRotation = (self.valueToDegrees(pointerValue, 254, 36) - 90);	
						}
						var currentRotation = self._currentRotation || targetRotation;
						self._currentRotation = targetRotation;
						
						return function(step) 
						{
							var rotation = currentRotation + (targetRotation-currentRotation)*step;
							return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")"; 
						}
					});
	}
	
	this.valueToDegrees = function(value, value1, value2)
	{
		// thanks @closealert
		//return value / this.config.range * 270 - 45;
		return value / this.config.range * value1 - (this.config.min / this.config.range * value1 + value2);
	}
	
	this.valueToRadians = function(value, value1, value2)
	{
		return this.valueToDegrees(value, value1, value2) * Math.PI / 180;
	}
	
	this.valueToPoint = function(value, factor, value1, value2)
	{
		return { 	x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value, value1, value2)),
					y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value, value1, value2)) 		};
	}
	
	// initialization
	this.configure(configuration);	
}