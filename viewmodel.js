var ViewModel = (function(){

	var commonSizes = [240, 320, 360, 480, 540, 720, 768, 800, 1080];
	var splitterWidth = 5;
	var bigIsLeft = true;
	var mouseDebouncingLength = 5;

	function ViewModel(){
		this.yoDawging = ko.observable(false);

		this.textInUrlBox = ko.observable(getUrlParameter());
		this.siteUrl = ko.computed(function(){
			if(this.textInUrlBox() === ""){
				return "";
			}
			if(this.textInUrlBox().indexOf("responsiveDesignTester.html")!== -1){
				this.yoDawging(true);
				this.textInUrlBox("");
				return "";
			}
			this.yoDawging(false);
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
		setSizeToSpecificValue.bind(this)(size);
	};

	ViewModel.prototype.splitterMouseDown = function(viewModel, event){
		viewModel.splitterIsDragging(true);
		this.splitterPreviousX = event.clientX;
		//prevents selecting
		event.preventDefault();
	}

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
	}

	ViewModel.prototype.splitterMouseLeave = function(viewModel, event){
		viewModel.splitterIsDragging(false);
		event.preventDefault();
	}

	function onSplitterMoveTimeoutComplete(event){
		var changeInX = event.clientX - this.splitterPreviousX;
		if(bigIsLeft){
			this.smallSize(Math.round(this.smallSize() - changeInX));
			this.bigSize(Math.round(this.bigSize() + changeInX));
		}
		else{
			this.smallSize(Math.round(this.smallSize() + changeInX));
			this.bigSize(Math.round(this.bigSize() - changeInX));
		}
		this.splitterPreviousX = event.clientX;
		event.preventDefault();
	}
	
	ViewModel.prototype.clearText = function(viewmodel){
		viewmodel.textInUrlBox("");
	}

	return ViewModel;
}())