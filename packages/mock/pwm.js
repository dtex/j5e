class PWM {
	
	static Output = 0x0a;
	
  constructor(opts) {
    this.pin = opts.pin;
		this.edge = (undefined === opts.edge) ? 0 : opts.edge;
		this.mode = opts.mode;
		this.onReadable = opts.onReadable;
		this.target = opts.target;
    this.resolution = 10;
    this.value = null;
	}
  
  read() {
		return this.value;
	}
  
  write(value) {
		this.value = value;
  }
  
}

export default PWM;