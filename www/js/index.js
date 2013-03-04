var GAME = function(){

	var _self = this;
	
	this.settings = {
		monsterTypes: 4,
		monsterSpawnRate: 800,
		bSize: {x: 6, y: 6 },
		maxMonster: 36
		
	};
	
	this.STOP = false;
	this.gameStartTime = null;
	this._clock = 0;	
	
	this.board = 'game-board';
	this.AppBody = document.body;
	
	this.boardElements = [];
	this.fieldsPool = [];
	
	this.inputQueue = [];
	this.lastRespawn = false;
	
	this.events = {};
	this.lastEvent = 0;
	this.tap = false;

	
	this.animationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            null ;
            
	this.monsterCounter = 0;
	
	this.tap = {hit:0, empty:0};
	
	
	this.inv_fps = 1000/ 60;
	this.next_frame = 0;
	this.frame_cpu = 0;


/*============*/

	this.init = function(){


		_self.the_board.init();
		_self.the_bind.init();
		_self.run();
	};
	
/*============*/	
	
	this.actionDevice = {
		
		vibrate: function() {
        	navigator.notification.vibrate(300);
        },
        beep: function(){
	        
        }
		
	}
	
	this.run = function(){
		if(!_self.STOP){
			_self.the_loop();
		}
		
		/*
		Dwa sposoby na wywoływanie pętli gry, klasyczny z timeoutem 1000/60 
		i nowy podobno lepszy dla mobile.
		
		Jestem w trakcie sprawdzania, gdy coś mi wolno chodzi, przełaczam na inny tryb.
		
		*/
		
	//  window.setTimeout(_self.run, _self.inc_fps);
		
		_self.animationFrame.call(window, _self.run);
   

	}
	
	this.helper = {
		clamp: function( value, min, max ) 
			{
				return (( value < min )?min:((value > max)?max:value)) ;
			},
		round: function( num, floating )
			{
				return ((floating == 0 )?Math.round(num):Math.round( num*10*floating)/(10*floating)) ;
			}	
	}
	
	this.the_loop = function(){
	
		var clock = new Date();
		var start_time = clock.getTime();
		
		if(!_self.gameStartTime){
			_self.gameStartTime = start_time;
		}
		
		//////
		_self.INPUT(start_time);
		_self.UPDATE(start_time, _self.inv_fps);
		_self.REDRAW();
		//////
		
		
		clock = new Date() ;
		var end_time = clock.getTime();
		var dt = ((end_time - start_time)/1000);
		
		_self.frame_cpu = dt ;
		_self.next_frame = _self.helper.clamp( _self.inv_fps-dt, 0, _self.inv_fps ) ;// clamp in case of lag
		
	}
	

	this.INPUT = function(T){
	
		if(_self.tap){
		
			var queue = _self.inputQueue;
			
			if(queue.length){
				for(var i=0; i < queue.length; i++){
					
					//var evTS = T- queue[i].ev.timeStamp;
					
					
					
						var target = queue[0].ev.target.getAttribute('id');
					
						switch(target){
							
							case _self.board:
								_self.the_board.event(queue[i]);
							break;
							
						}
						queue.splice(i, 1);		
				}				
			}
			
		}

	}
	
	this.UPDATE = function(T, dt){
		var s = _self.settings,
			playTime = T - _self.gameStartTime,
			monsterCounter = _self.monsterCounter,
			boardElements = _self.boardElements,
			lastRespawn = _self.lastRespawn,
			maxMonster = s.maxMonster;
			
			
		if(!lastRespawn){
				lastRespawn = _self.gameStartTime;
			}
			
		if(monsterCounter){
			//if( s.monsterSpawnRate < 5){
				s.monsterSpawnRate = s.monsterSpawnRate - 0.09;
			//}
			
		}	
			
		_self._clock =  playTime ;

		if( maxMonster >  monsterCounter ){				
			var reSpownTimer = (T - lastRespawn)  ;
			
			if(  s.monsterSpawnRate <= reSpownTimer ){
			
					var newMonster = _self.the_board.createMonster(T);
					
					if(newMonster){
					
						/*
							brakuje tu paru funkcji
						*/
					
						boardElements[newMonster.id].monster = newMonster;
					//	boardElements[newMonster.id].locked = true;
						
						
						
						var updateMonster = _self.the_board.updateMonsters(newMonster);
						
						if(updateMonster){
							_self.the_board.toggleFreez(updateMonster, true);
						}
						
						
						_self.monsterCounter++;
						_self.the_board.toggle(newMonster.id, newMonster.type, true);
						_self.lastRespawn = newMonster.born;

					}
			}

		}
		else if(boardElements.length ==  monsterCounter ){


			_self.STOP = true;
			_self._clock = 'KONIEC' ;
			
		}
		
		
		var log_delta = document.getElementById("log_cpu");
		log_delta.innerHTML =  "time : " + _self._clock;

		/*
		var log_delta = document.getElementById("log_delta");
		var log_cpu = document.getElementById("log_cpu");
		var log_free = document.getElementById("log_free");
			log_delta.innerHTML =  "delta time :   " + _self.helper.round(dt*1000, 10) + " ms" , 20, 20  ;
			log_cpu.innerHTML = "cpu frame  :   " + _self.helper.round( _self.frame_cpu *1000, 10) + " ms" , 20, 60  ;
			log_free.innerHTML = "free frame :   " + _self.helper.round( _self.next_frame *1000, 10) + " ms" , 20, 100 ;
			*/
	}
	
	this.REDRAW = function(){
	
	var log_delta = document.getElementById("log_delta");
	var log_cpu = document.getElementById("log_cpu");
	var log_free = document.getElementById("log_free");
	
		log_delta.innerHTML = (_self.tap.hit);
	//	log_cpu.innerHTML = (_self.tap.empty);
		
	};
	
	this.the_board = { 
		init: function(){
			var s = _self.settings;
			var c = s.bSize.x;
			var r = s.bSize.y;
			
			var index = 0;
		
			for(var i=0; i < c; i++){
				for(var j=0; j < r; j++){
						_self.boardElements.push(
							{
								x:i,
								y:j,
								locked: false,
								monster: {
									born: false,
									type: false,
									isBlock: false,
									isStronger: false	
								}

							});
							
							_self.fieldsPool.push(index);
							
							var li = document.createElement('li');
								li.setAttribute('id', 'field_'+index);
								li.setAttribute('data-index', index);
								
							var b = document.createElement('b');
								b.className ='board-field';
								
								//DEBUG
								b.innerHTML = index;
							
							var em = document.createElement('em');
								em.className = 'monster';
							
							
							li.appendChild(em);
							li.appendChild(b);
							
							document.getElementById(_self.board).appendChild(li);
							
							index++;
					}
			}
	    },
	    
	    createMonster: function(born){
	    
	    	var s = _self.settings,
	    	type = Math.floor((Math.random()* (s.monsterTypes+1) )+0),
	    	fieldId = this._findPlace(),
	    	newMonster = {
						id: fieldId,
						born: born,
						type: type,
						isBlock: false,
						isStronger: false	
				};
				
				return this.newMonster;
		},
		
		getMonsterIdByPosition: function(x,y, id){
			var els = _self.boardElements;
			
			var idx = els.filter(function(e,i,a){
				return (e.x == x && e.y == y);
			});
			
			
			
			if(idx[0]){
				if( idx[0].monster.id && 
					idx[0].monster.type == els[id].monster.type){
					return idx[0].monster.id;
				}
			}
			
		},
		
		updateMonsters: function(monster){
		
			var mId = monster.id,
				mType = monster.type,
				monsterOffset = 3,
				fields = [],
				bSize = _self.settings.bSize.x,
				el = _self.boardElements;
				
			//	for(var i= -(bSize+1); i <= (bSize+1); i++){
			//		var v = mId - i;
					//if( (v % monsterOffset) == 0 ){
				//		fields.push(  [v % monsterOffset, v] );	
					//}
			//	}
				
			///	for(var i=0; i < monsterOffset*monsterOffset; i++ ){
			//		fields[i] = _self.boardElements[i];	
			//	}

				for(var x=-1; x <= 1; x++){
						for(var y= -1; y <= 1; y++){
							var nearMonsterId = _self.the_board.getMonsterIdByPosition( (el[mId].x - x) , (el[mId].y - y), mId);
								if(nearMonsterId && mId != nearMonsterId){
									fields.push( nearMonsterId );
								}	
						}
				}
			return fields;			
		},
		
		_findPlace: function(){
			
		
			var fieldId = Math.floor((Math.random() * (  _self.fieldsPool.length) ));
			var outId = _self.fieldsPool[fieldId];
			
			
			_self.fieldsPool[fieldId] = _self.fieldsPool[_self.fieldsPool.length - 1];
			_self.fieldsPool.pop();
			
			return outId;
		},		
		
		
		killMonster: function(monster){
		
			_self.monsterCounter--;
			
			_self.the_board.toggle(monster.id, monster.type, false);
			
			
			_self.fieldsPool.push(monster.id);		
		},
		
		toggle: function(id, type, show){
			var monsterField = '#field_'+id+' em';
			
			if(show){
				var monsterId = 'monster_'+type;
						
				$(monsterField, '#'+_self.board).addClass(function(){
					this.style.webkitAnimationPlayState = "running";
					return monsterId;
				});
			}else{
			
				$(monsterField, '#'+_self.board).attr({class: ''});
						
			}
		},
		toggleFreez: function(monster, freez){
			
			for(var i=0; i <= monster.length; i++ ){
				var monsterField = '#field_'+monster[i]+' b';
		
				
				$(monsterField).addClass('block');

				
			}
			
		},
		
		event: function(input){
			var data = input.data;
			var ev = input.ev;
			
			
		//zamienić, monster table musi czyscic
			
			if(data.monster.id){
				this.killMonster(data.monster);
				_self.tap.hit = _self.tap.hit+1;
			}else{
				_self.tap.empty--;
			   // _self.actionDevice.vibrate();
			}
	
		}
    }
	
	this.the_bind = {
		init: function(){
		
			var eventHolder = document.getElementById(_self.board);
		
			_self.events['board'] = Hammer(eventHolder).on("tap doubletap", _self.the_bind.tapMonster);
			_self.events['board'] = Hammer(eventHolder).on("release", _self.the_bind.tapMonster);
			
		},

		tapMonster: function(event) {
				_self.tap = true;
				
				if(event.gesture){
					var target = event.gesture.target;	
				
				
					var id = parseInt(target.parentNode.getAttribute('data-index'),10 );
					var data = _self.boardElements[id];
					
					
					
					//normalne bindowanie
					//_self.the_board.event({ev: event, data: data});
					
					
					//bindowanie przez kolejke
					_self.inputQueue.push({ev: event, data: data});
					
				}	
				

		 }
	}
    

	
	this.init();
}



var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('online', this.onDeviceOnline, false);
        document.addEventListener('offline', this.onDeviceOffline, false);
    },
    
    
    onDeviceReady: function() {
    	 GAME();
    },
    
    onDeviceOnline:function(){},
    onDeviceOffline:function(){}
};
