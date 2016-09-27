function GaugeBorder(placeholderName, configuration)
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

		this.config.redColor 	= configuration.redColor || "#75c5f0";
		this.config.yellowColor = configuration.yellowColor || "#46a1cb";
		this.config.t_yellowColor 	= configuration.t_yellowColor || "#42929d";
		this.config.greenColor 	= configuration.greenColor || "#84c225";
		this.config.t_greenColor 	= configuration.t_greenColor || "#00923f";
		
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

		this.drawBand(0, 100, "#ffffff", 0.4, 0.95, 271, 46.5,2);
		this.drawBand(0, 100, "#4d4948", 0.4, 0.85, 270.6, 46,1);
		
		for (var index in this.config.t_greenZones)
		{
			this.drawBand(this.config.t_greenZones[index].from, this.config.t_greenZones[index].to, self.config.t_greenColor, 0.4, 0.6, 270, 45);
		}

		for (var index in this.config.greenZones)
		{
			this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor, 0.4, 0.6, 270, 45);
		}
		
		for (var index in this.config.t_yellowZones)
		{
			this.drawBand(this.config.t_yellowZones[index].from, this.config.t_yellowZones[index].to, self.config.t_yellowColor, 0.4, 0.6, 270, 45);
		}

		for (var index in this.config.yellowZones)
		{
			this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor,0.4, 0.6, 270, 45);
		}

		for (var index in this.config.redZones)
		{
			this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor, 0.4, 0.6, 270, 45);
		}
	}
	
	this.drawBand = function(start, end, color, inner_radius, outer_radius, value1, value2, stroke_width)
	{
		if (0 >= end - start) return;
		
		this.body.append("svg:path")
					.style("fill", color)
					.style("stroke","201b18")
					.style("stroke-width",stroke_width+"px")
					.attr("d", d3.svg.arc()
						.startAngle(this.valueToRadians(start, value1, value2))
						.endAngle(this.valueToRadians(end, value1, value2))
						.innerRadius(inner_radius * this.config.raduis)
						.outerRadius(outer_radius * this.config.raduis))
					.attr("transform", function() { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate("+value1+")" });
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
	// initialization
	this.configure(configuration);	
}