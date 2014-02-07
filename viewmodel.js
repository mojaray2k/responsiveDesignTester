var ViewModel = (function(){

	var commonSizes = [240, 320, 360, 480, 540, 720, 768, 1080];
	var splitterWidth = 5;

	function ViewModel(){
		this.siteUrl = ko.observable("");
		this.currentSizes = ko.observableArray([]);
		this.leftSize = ko.observable();
		this.rightSize = ko.observable();

		this.splitterIsDragging = false;
		this.splitterPreviousX = undefined;

		updateLeftAndRightSizes.bind(this)();
		updateCurrentSizes.bind(this)();

		window.onresize = handleResize.bind(this);
		adjustContentHeight();
	}

	function updateLeftAndRightSizes(){
		var initialized = this.leftSize() !== undefined || this.rightSize() !== undefined;
		var browserWidth = window.innerWidth;
		if(!initialized){
			this.leftSize(320);
			this.rightSize((browserWidth - 320) - splitterWidth);
			return;
		}
		var oldWidth = this.leftSize() + this.rightSize() + splitterWidth;
		var leftRatio = this.leftSize()/oldWidth;
		var rightRatio = (this.rightSize()+splitterWidth)/oldWidth;
		this.leftSize(leftRatio * browserWidth);
		this.rightSize(rightRatio * browserWidth);
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
		updateLeftAndRightSizes.bind(this)();
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
		this.leftSize(value);
		this.rightSize(browserWidth - value - splitterWidth);
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
		this.leftSize(this.leftSize() + changeInX);
		this.rightSize(this.rightSize() - changeInX);
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