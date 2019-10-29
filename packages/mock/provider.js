class Digital {
	
	static Output = 0x01;

  constructor(opts) {
    this.pin = opts.pin;
		this.edge = (undefined === opts.edge) ? 0 : opts.edge;
		this.mode = opts.mode;
		this.onReadable = opts.onReadable;
		this.target = opts.target;
	}
  
  read() {
		
	}
  
  write(value) {
		
  }
  
}

class PWM {
	
	static Output = 0x0a;
	
  constructor(opts) {
    this.pin = opts.pin;
		this.edge = (undefined === opts.edge) ? 0 : opts.edge;
		this.mode = opts.mode;
		this.onReadable = opts.onReadable;
		this.target = opts.target;
		this.resolution = 10;
	}
  
  read() {
		
	}
  
  write(value) {
		
  }
  
}

export { Digital, PWM };