var ViewModel = (function(){

	var commonSizes = [320, 360, 480, 540, 720, 768, 800, 854, 1080];
	var splitterWidth = 5;
	
	var bigIsLeft = true;

	function ViewModel(){
		this.textInUrlBox = ko.observable("");
		this.siteUrl = ko.computed(function(){
			if(this.textInUrlBox() === ""){
				return "";
			}
			var firstFourLetters = this.textInUrlBox().substr(0,4);
			if(firstFourLetters === "http"){
				return this.textInUrlBox();
			}
			return "http://"+this.textInUrlBox();
		}, this);
		this.currentSizes = ko.observableArray([]);
		this.smallSize = ko.observable();
		this.bigSize = ko.observable();

		this.splitterIsDragging = false;
		this.splitterPreviousX = undefined;

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

	ViewModel.prototype.sizeButtonClicked = function(size){
		setSizeToSpecificValue.bind(this)(size);
	};

	ViewModel.prototype.splitterMouseDown = function(viewModel, event){
		viewModel.splitterIsDragging = true;
		this.splitterPreviousX = event.clientX;
		//prevents selecting
		event.preventDefault();
	}

	ViewModel.prototype.splitterMouseMove = function(viewModel, event){
		if(!viewModel.splitterIsDragging){
			event.preventDefault();
			return;
		}
		var changeInX = event.clientX - this.splitterPreviousX;
		if(bigIsLeft){
			this.smallSize(this.smallSize() - changeInX);
			this.bigSize(this.bigSize() + changeInX);
		}
		else{
			this.smallSize(this.smallSize() + changeInX);
			this.bigSize(this.bigSize() - changeInX);
		}		
		this.splitterPreviousX = event.clientX;
		event.preventDefault();
	};

	ViewModel.prototype.splitterMouseUp = function(viewModel, event){
		viewModel.splitterIsDragging = false;
		event.preventDefault();
	}

	ViewModel.prototype.splitterMouseLeave = function(viewModel, event){
		viewModel.splitterIsDragging = false;
		event.preventDefault();
	}

	return ViewModel;
}())