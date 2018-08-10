class Assistant {
	radian = Math.PI / 180
	c
	blueprint

	constructor(c, blueprint) {
		this.c = c;
		this.blueprint = blueprint
	}

	draw = () => {
		let _this= this;

		_this.blueprint.forEach(el => {
			_this.c.beginPath();
			_this.c.strokeStyle = el.color;
			_this.c.lineWidth = el.lw;
			_this.c.arc(el.x, el.y, el.radius, el.startAngle * _this.radian, el.endAngle * _this.radian, el.ccw);
			_this.c.lineCap = "round";
			_this.c.stroke();
			_this.c.closePath();
		});
	}

	update = () => {
		let _this= this;

		_this.blueprint.forEach(el => {
			el.startAngle += el.speed;
			el.endAngle += el.speed;

			_this.draw()
		});
	}
}

export default Assistant;
