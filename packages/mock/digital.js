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

export default Digital;