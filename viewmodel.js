var ViewModel = (function(){

	//var commonSizes = [240, 320, 360, 480, 540, 720, 768, 800, 1080];
	var commonSizes = [1080, 800, 768, 720, 540, 480, 360, 320, 240];
	var minSize = commonSizes[commonSizes.length -1];
	var splitterWidth = 5;
	var bigIsLeft = true;
	var mouseDebouncingLength = 5;
	//This is the time it takes for the iframe error to display
	var iframeErrorWaitDuration = 4000;
	//THIS IS THE SAME AS THE SCSS IF YOU CHANGE IT THERE, CHANGE IT HERE
	var slideTransitionDuration = 400;

	function ViewModel(){
		this.yoDawging = ko.observable(false);

		this.shouldTransition = ko.observable(false);
		this.transitionDeactivateTimer = undefined;

		this.showIframeError = ko.observable(false);
		this.iframeErrorTimer = undefined;

		this.textInUrlBox = ko.observable(getUrlParameter());
		this.siteUrl = ko.computed(function(){
			if(this.textInUrlBox() === ""){
				return "";
			}
			if(this.textInUrlBox().indexOf("responsiveDesignTester.html")!== -1 || this.textInUrlBox().indexOf("http://bxyoung89.github.io/responsiveDesignTester") !== -1){
				this.yoDawging(true);
				this.textInUrlBox("");
				return "";
			}
			this.yoDawging(false);
			this.showIframeError(false);
			this.iframeErrorTimer = window.setTimeout(function(){
				window.clearTimeout(this.iframeErrorTimer);
				this.showIframeError(true);
			}.bind(this), iframeErrorWaitDuration)
			var firstFourLetters = this.textInUrlBox().substr(0,4);
			if(firstFourLetters === "http"){
				return this.textInUrlBox();
			}
			return "http://"+this.textInUrlBox();
		}, this);
		this.textInUrlBox.subscribe(setUrlParameter.bind(this));
		this.currentSizes = ko.observableArray([]);
		this.smallSize = ko.observable();
		this.bigSize = ko.observable();


		this.splitterIsDragging = ko.observable(false);
		this.splitterPreviousX = undefined;
		this.splitterMoveTimeout = undefined;
		
		this.lightboxIsVisible = ko.observable(false);

		updateSizes.bind(this)();
		updateCurrentSizes.bind(this)();

		window.onresize = handleResize.bind(this);
		adjustContentHeight();
	}

	function updateSizes(){
		var initialized = this.smallSize() !== undefined || this.bigSize() !== undefined;
		var browserWidth = window.innerWidth;
		if(!initialized){
			this.smallSize(320);
			this.bigSize((browserWidth - 320) - splitterWidth);
			return;
		}
		var oldWidth = this.smallSize() + this.bigSize() + splitterWidth;
		var smallRatio = this.smallSize()/oldWidth;
		var bigRatio = (this.bigSize()+splitterWidth)/oldWidth;
		this.smallSize(smallRatio * browserWidth);
		this.bigSize(bigRatio * browserWidth);
	}

	function updateCurrentSizes(){
		this.currentSizes.removeAll();
		var currentWidth = window.innerWidth;
		commonSizes.forEach(function(size){
			if(size > (currentWidth*.8)){
				return;
			}
			this.currentSizes.push(size);
		}, this);
	}

	function handleResize(){
		updateSizes.bind(this)();
		updateCurrentSizes.bind(this)();
		adjustContentHeight();
	}

	function adjustContentHeight(){
		var pageHeight = window.innerHeight;
		var bannerHeight = document.getElementById("banner").clientHeight;
		document.getElementById("content").style.height = ((pageHeight *1) - (bannerHeight *1)) +"px";
	}

	function setSizeToSpecificValue(value){
		var browserWidth = window.innerWidth;
		this.smallSize(value);
		this.bigSize(browserWidth - value - splitterWidth);
	}

	function setUrlParameter(){
		if(this.siteUrl() === ""){
			return;
		}
		window.location.search ="site="+this.siteUrl();
	}

	function getUrlParameter(){
		var parameter = window.location.search;
		return parameter.replace("?site=", "");
	}

	ViewModel.prototype.sizeButtonClicked = function(size){
		this.shouldTransition(true);
		setSizeToSpecificValue.bind(this)(size);
		this.transitionDeactivateTimer = window.setTimeout(function(){
			window.clearTimeout(this.transitionDeactivateTimer);
			this.shouldTransition(false);
		}.bind(this),slideTransitionDuration)

	};

	ViewModel.prototype.splitterMouseDown = function(viewModel, event){
		viewModel.splitterIsDragging(true);
		this.splitterPreviousX = getClientX(event);
		//prevents selecting
		event.preventDefault();
	};

	ViewModel.prototype.splitterMouseMove = function(viewModel, event){
		if(this.splitterMoveTimeout !== undefined){
			window.clearTimeout(this.splitterMoveTimeout);
		}
		var self = this;
		this.splitterMoveTimeout = window.setTimeout(function(){ onSplitterMoveTimeoutComplete.bind(self)(event);}, mouseDebouncingLength);
	};

	ViewModel.prototype.splitterMouseUp = function(viewModel, event){
		viewModel.splitterIsDragging(false);
		event.preventDefault();
	};

	ViewModel.prototype.splitterMouseLeave = function(viewModel, event){
		viewModel.splitterIsDragging(false);
		event.preventDefault();
	};

	function getClientX(event){
		if(event.clientX !== undefined){
			return event.clientX;
		}
		var touches = event.changedTouches;
		if(touches === undefined || touches.length === 0){
			return 0;
		}
		return touches[0].clientX;
	}

	function onSplitterMoveTimeoutComplete(event){
		var changeInX = getClientX(event) - this.splitterPreviousX;
		this.splitterPreviousX = getClientX(event);
		var newSmallSize = 0;
		var newBigSize = 0;
		if(bigIsLeft){
			newSmallSize = Math.round(this.smallSize() - changeInX);
			newBigSize = Math.round(this.bigSize() + changeInX);
		}
		else{
			newSmallSize = Math.round(this.smallSize() + changeInX);
			newBigSize = Math.round(this.bigSize() - changeInX);
		}
		if(newSmallSize < minSize || newBigSize < minSize){
			event.preventDefault();
			return;
		}

		this.smallSize(newSmallSize);
		this.bigSize(newBigSize);
		event.preventDefault();
	}
	
	ViewModel.prototype.clearText = function(viewmodel){
		viewmodel.textInUrlBox("");
	};
	
	ViewModel.prototype.hideLightbox = function(viewmodel){
		viewmodel.lightboxIsVisible(false);
	};
	
	ViewModel.prototype.showLightbox = function(viewmodel){
		viewmodel.lightboxIsVisible(true);
	};
	
	ViewModel.prototype.toggleLightbox = function(viewmodel){
		viewmodel.lightboxIsVisible(!viewmodel.lightboxIsVisible());
	};
	
	ViewModel.prototype.keyPressedInUrlBox = function(viewmodel, event){
		if(event.keyCode === 13 || event.which === 13){
			refreshUrl.bind(viewmodel)();
		}
	
	};
	
	function refreshUrl(){
		var url = this.siteUrl();
		this.textInUrlBox("");
		this.textInUrlBox(url);
	}

	return ViewModel;
}())