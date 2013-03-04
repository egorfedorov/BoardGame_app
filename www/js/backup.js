

var GAME = function(){

	var self = this;
	
	this.taped = ko.observable();
	this.t = ko.observable();
	
	this.interval = 1000;
	
	var a = document.getElementById("game-board");
	
	this.bodyBind = new Hammer(a );
	this.timer= ko.observable(false);
	this.timerInterval;

	this._clock = ko.observable(0);
	this.boardElements = [];

	this.__initGame = function(){
		self._Board.init();
		self._Clock.init();
	}
	
	
	this.hammer = function(ev){
		
				console.log(ev); 
				
			var	tapedfield = ev.originalEvent.target;
	
			self.taped(tapedfield.innerHTML); 
			
			self.t(ev.touches.length +' | '+ev.type);
			
			
			var liclass = document.createAttribute("class");
				liclass.nodeValue = "active";
				tapedfield.setAttributeNode(liclass);
		
	}
	


this.bodyBind.onrelease = function(ev) {self.hammer(ev); };
this.bodyBind.ondrag = function(ev) {self.hammer(ev); };	
	
	

	
	
	this._Clock = {
		init: function(){
		
			if(self.timer){
				window.clearInterval(self.timerInterval ); // poprawic
				self.timerInterval = window.setInterval(function(){ self._Clock._step() }, self.interval);
			}	
		},
		start: function(){
			self.timer(true);
			self._Clock.init();
		},
		reset: function(){
			self._clock(0);
		},
		stop: function(){
			self.timer(false);
			window.clearInterval(self.timerInterval );
		},
		_step: function(){
			var cc = self._clock();
			self._clock(cc+1);
			
			return true;
		}
	}
	this._Board = { 
	
		init: function(){
		
			var c = 6;
			var r = c;
		
			for(var i=0; i < c; i++){
				for(var j=0; j < r; j++){
						self.boardElements.push([i,j]);
					}
			}
	  	  
	  	  /* old foreach
		  for(var i=0; i<36; i++){
		  		var cell = document.createElement("li");
		  		var id = document.createAttribute('id');
		  		id.nodeValue = 'i'+i;
		  		
		  		cell.setAttributeNode(id);
		  	
		  		
		  		
		  		var cellContent = document.createTextNode(i);
		  		cell.appendChild(cellContent);
		  		
		  		app.boardElement.appendChild(cell);
		  
		  		//console.log(i);
		  		}  
		  		
		  		*/
		    
	    }
    
    }

	
	this.__initGame();
	
	
	
}

