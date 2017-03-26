/*
jQuery-svg-progress
URL: http://tsumbaluk.in.ua/plugins/jquery-svg-progress
Author: Alexander Tsymbalyuk <tsumbaluk888@gmail.com>
Version: 1.0.3
License: MIT
*/
;(function ( $, window, document, undefined ) {
		var customInd = 0;
		var pluginName = 'svgprogress',
				defaults = {
					figure: "hexagon",
					endFill: 100,

					unitsOutput: '%',

					progressFill: '#fcbf02',
					progressFillGradient: [],
					progressWidth: 2,
					background: 'transparent',

					emptyFill: '#999',
					emptyFillOpacity: 0.3,

					animationDuration: 2,
					onProgressState: function(){},
					onAnimationComplate: function(){}
				};

		function Plugin( element, options, index) {
			this.index = index;
			this.element = element;
			this.config = $.extend( {}, defaults, options);
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}
		Plugin.prototype.init = function () {	
			var step = 0;
			var calcProcent = function(time,reverse){
				if(step < config.endFill && reverse !== true){
					setTimeout(calcProcent,time,time);
					step++;
					config.onProgressState(step);
					$(that).find('.svg-progress-output').html(step+config.unitsOutput);
				}else if(reverse === true && step > 0){
					setTimeout(calcProcent,time,time,true);
					step--;
					config.onProgressState(step);
					$(that).find('.svg-progress-output').html(step+config.unitsOutput);
				}else{
					config.onAnimationComplate();
					step = 0;
					return;
				}
			};

			var that       = this.element,
					config     = this.config,
					iteration  = this.index,
					pathLength = null,
					progress   = {
						width: $(that).width(),
						height: $(that).height(),					
						getRandomInt: function(min, max){				
							return Math.floor(Math.random() * (max - min + 1)) + min;
						},
						startProgress: function(path){
							if(step === 0){
								var length = path.getTotalLength(),
										endFill = config.endFill > 100 ? 100 : config.endFill;
								this.pathLength = length;
								path.style.transition = path.style.WebkitTransition = 'none';
								path.style.strokeDasharray = length + ' ' + length;
								path.style.strokeDashoffset = length;
								path.getBoundingClientRect();
								path.style.transition = path.style.WebkitTransition =  'stroke-dashoffset '+ config.animationDuration +'s ease-in-out';			
								path.style.strokeDashoffset = (length * (100 - endFill) / 100).toString();
								calcProcent(config.animationDuration*1000/config.endFill);
							};
						},
						reverseProgress: function(path){
							if(this.pathLength !== 0 && step === 0){
								var length  = path.getTotalLength(),
										endFill = config.endFill > 100 ? 100 : config.endFill;
								this.pathLength = 0;
								step = endFill;
								path.style.transition = path.style.WebkitTransition =  'stroke-dashoffset '+ config.animationDuration +'s ease-in-out';			
								path.style.strokeDashoffset = length;
								calcProcent(config.animationDuration*1000/endFill,true);							
							};
						},
						destroyProgress: function(path){
							if(this.pathLength !== 0){
								var length = path.getTotalLength();
								this.pathLength = 0;
								path.style.transition = path.style.WebkitTransition = 'none';
								path.style.strokeDashoffset = length;								
							};
						},
						selectFigure: function(){
							var stepX   = this.width/4,
									stepY   = this.height == false ? this.width/4 : this.height/4,
									path = null;

							if(typeof config.figure === 'string'){								
								switch(config.figure) {
									case 'hexagon':
										path = 'M0 '+ stepY*3 +' 0 '+ stepY+'L 0 '+ stepY +' '+ stepX*2 +' 0L '+stepX*4+' '+ stepY +'L '+ stepX*4 +' '+ stepY*3 +'L '+ stepX*4 +' '+ stepY*3 +' '+ stepX*2 +' '+ stepY*4 +' 0 '+ stepY*3 +' Z';
										break;
									case 'rhomb':
										path = 'M0 '+ stepY*2 +' '+ stepX*2 + ' 0L '+ stepX*2+ ' 0 '+stepX*4+' '+stepY*2+ 'L '+stepX*4+' '+stepY*2+' '+stepX*2+' '+stepY*4+ ' 0 '+stepY*2+' Z';
										break;
									case 'rect':
										path = 'M0 '+ stepY*4 +' 0 0L '+ stepX*4+ ' 0 '+stepX*4+' '+stepY*4+ 'L 0 '+stepY*4+' 0 '+stepY*4+' Z';
										break;
									case 'triangle':
										path = 'M'+stepX*2+' 0 '+stepX*4+' '+stepY*4+'L '+ stepX*4+ ' '+stepY*4+'L 0 '+stepY*4+' Z';
										break;
									case 'pentagon':									
										path = 'M0 '+ stepY*2 +' '+stepX*2 +' 0L '+ stepX*2+ ' 0 '+stepX*4+' '+stepY*2+ 'L '+stepX*3+' '+stepY*4+'  '+stepX+' '+stepY*4+' Z';
										break;
									case 'circle':
										path = 'M 0,'+stepX*2+' a '+stepX*2+','+stepX*2+' 0 1,0 '+stepX*4+',0a'+stepX*2+' ,'+stepX*2+' 0 1 0 -'+stepX*4+' 0';
										break;
									default:
										break;
								};
							}else{
								path = config.figure.path;
							}
							return path;
						},
						createMarkup: function(){
							var path       = this.selectFigure(),
									name       =  typeof config.figure === 'string' ? config.figure : 'path',
									viewBox    = this.height === false ? (this.width/4+config.progressWidth) : (this.height/4+config.progressWidth);
									gradient   = '',
									strokeFill = null;
							if(config.progressFillGradient.length > 0 && config.progressFillGradient.length < 3){
										// '<stop offset="50%"  stop-color="'+config.progressFillGradient[1]+'"/>'+
								gradient = '<defs>'+
									'<linearGradient id="linear'+name+'-progress'+iteration+customInd +'" x1="0%" y1="0%" x2="100%" y2="0%">'+
										'<stop offset="0%"   stop-color="'+config.progressFillGradient[0]+'"/>'+
										'<stop offset="100%" stop-color="'+config.progressFillGradient[1]+'"/>'+
									'</linearGradient>'+
								'</defs>';
								strokeFill = 'url(#linear'+name+'-progress'+iteration+customInd +')';
							}else{
								strokeFill = config.progressFill;
							};
							return	newSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'+
												'width="'+ this.width +'px" height="'+ this.height +'px" viewBox="'+ -config.progressWidth/2 +' '+ -config.progressWidth/2 +' '+(this.width+config.progressWidth)+' '+ (this.height == false ? this.width+config.progressWidth : this.height+config.progressWidth) +'"'+ 
												'preserveAspectRatio="xMidYMid meet" class="'+ name+'-progress'+iteration+customInd +'" xmlns:svg="http://www.w3.org/2000/svg">'+gradient+
												'<path stroke="'+strokeFill+'" class="polygon" style="stroke-width: '+config.progressWidth+'px;" d="'+path+'" fill="'+config.background+'"></path>'+
												'</svg>';
						},
						bildProgressFigure: function(){
							if(config.figure === 'circle'){
								$(that).css('height', this.width+'px');
								this.height = this.width;
							};
							$(that).append(this.createMarkup())
								.find('.svg-progress-output').html('0'+config.unitsOutput);
							var name   =  typeof config.figure === 'string' ? config.figure : 'path',
									path   =  document.querySelector('.'+ name +'-progress'+iteration+customInd+' path'),
									length = path.getTotalLength();

							$(path).clone().appendTo($(that).find('svg')).attr({
								'stroke-opacity': config.emptyFillOpacity,
								'stroke': config.emptyFill
							});
							path.style.strokeDasharray = length + ' ' + length;
							path.style.strokeDashoffset = length;

							$(that).on('redraw', function(event) {
								progress.startProgress(path);
							}).on('reverse', function(){
								progress.reverseProgress(path);
							}).on('destroy', function(){
								$(this).find('.svg-progress-output').html('0'+config.unitsOutput);
								progress.destroyProgress(path);
							});
							customInd++;
						},
						init: function(){	
							var endFill = that.getAttribute('data-progress-value');
							config.endFill = endFill === null ? config.endFill : endFill-0;
							this.bildProgressFigure();							
						}
					};
			progress.init();
		};
		$.fn[pluginName] = function ( options ) {
			return this.each(function (index) {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, 
					new Plugin( this, options, index));
				}
			});
		}
})( jQuery, window, document );