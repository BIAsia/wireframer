/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */


const {Rectangle, Color, Text, SceneNode, Ellipse} = require("scenegraph"); 
var wireColor = new Color("White");
var cornerColor = new Color("#FFAC3B", 0.3);
var cornerSize = 24;

function wireframeHandlerFunction(selection) { 
	let select = selection.items;
	select.forEach((node)=>{traverseChildrenWireframe(node);});
}

function skeletonHandleFunction(selection) { 
	let select = selection.items;
	select.forEach((node)=>{traverseChildrenSkeleton(node, selection);});
}

function addCornerHandlerFunction(selection) { 
	let select = selection.items;
	select.forEach((rectangle)=>{
		if (rectangle.constructor.name == "Rectangle"){
			var radius = rectangle.cornerRadii, bounds = rectangle.boundsInParent;
			console.log(bounds);
			let topL = {topLeft:radius.topLeft, topRight:0, bottomRight:0, bottomLeft:0},
				topR = {topLeft:0, topRight:radius.topRight, bottomRight:0, bottomLeft:0},
				bottomR = {topLeft:0, topRight:0, bottomRight:radius.bottomRight, bottomLeft:0},
				bottomL = {topLeft:0, topRight:0, bottomRight:0, bottomLeft:radius.bottomLeft};
			createNewCorner(0,0,topL, bounds, selection);
			createNewCorner(bounds.width-cornerSize,0,topR, bounds, selection);
			createNewCorner(0,bounds.height-cornerSize,bottomL, bounds, selection);
			createNewCorner(bounds.width-cornerSize,bounds.height-cornerSize,bottomR, bounds, selection);
		}
	});
}

function createNewCorner(X, Y, cornerRadii,bounds, selection){
	var newBounds = {x:bounds.x + X, y:bounds.y + Y, width:cornerSize, height:cornerSize};
	const newElement = new Rectangle();
	newElement.width = cornerSize;
	newElement.height = cornerSize;
    newElement.fill = cornerColor;
    newElement.cornerRadii = cornerRadii;
    selection.insertionParent.addChild(newElement);
    newElement.moveInParentCoordinates(newBounds.x, newBounds.y);
}

function traverseChildrenWireframe(root){
	if (root.constructor.name != "Artboard" && root.opacity != 0) root.opacity = 1;
	if (root.isContainer){
		if (root.mask){
			var mask = root.mask;
			console.log(mask);
			mask.removeFromParent();
			root.addChild(mask, 0);
		}
		 if (root.constructor.name == "BooleanGroup"){ root.fill = wireColor} else
		root.children.forEach((children,i)=>{
			traverseChildrenWireframe(children);
		})
	} else {
		if (root.constructor.name == "Text" || root.constructor.name == "Path") root.fill = wireColor;
		else {
			if (root.fillEnabled) root.fillEnabled = false;
			if (!root.strokeEnabled) root.strokeEnabled = true;
			root.stroke = wireColor;
		}
		root.shadow = null;
	}
}

function traverseChildrenSkeleton(root, selection){
	//if (root.constructor.name != "Artboard" && root.opacity != 0) root.opacity = 0.3;
    if (root.opacity == 0) return;
	if (root.isContainer){
        if (root.dynamicLayout){
            root.dynamicLayout = false;
        }
        
		if (root.mask){
			var mask = root.mask;
			mask.removeFromParent();
			root.addChild(mask, 0);
		}
		//if (root.constructor.name == "ScrollableGroup"){} 
        //else
            root.children.forEach((children)=>{
                traverseChildrenSkeleton(children, selection);
            })
	} else {
        switch(root.constructor.name){
            case "Text":
                var newBounds = root.boundsInParent;
                var newElement = newRect(newBounds.width, newBounds.height);
                //selection.insertionParent.addChild(root.parent);
                if (root.parent.constructor.name == "ScrollableGroup" || root.parent.constructor.name == "BooleanGroup") break;
                root.parent.addChildBefore(newElement, root);
                //selection.insertionParent.addChild(newElement);
                newElement.moveInParentCoordinates(newBounds.x, newBounds.y);
                root.removeFromParent();
                root = newElement;
                break;
            case "Path":
                var newBounds = root.boundsInParent;
                console.log(newBounds);
                var newElement = newCircle((newBounds.height > newBounds.width)?newBounds.height:newBounds.width);
                //selection.insertionParent.addChild(root.parent);
                if (root.parent.constructor.name == "ScrollableGroup" || root.parent.constructor.name == "BooleanGroup") break;
                root.parent.addChildBefore(newElement, root);
                //selection.insertionParent.addChild(newElement);
                newElement.moveInParentCoordinates(newBounds.x, newBounds.y);
                root.removeFromParent();
                root = newElement;
                break;
            case "Line":
                root.stroke = wireColor;
                break;
            default:
                if (!root.fillEnabled) root.fillEnabled = true;
                if (root.stroke) root.stroke = wireColor;
                root.fill = wireColor;
        }
        /*
        if (root.constructor.name == "Text"){
            
        }
		else if (root.constructor.name == "Path"){
            
        }
        else if (root.constructor.name == "Line"){
            
        }*/
        /*
        else {
			if (root.fillEnabled) root.fillEnabled = false;
			if (!root.strokeEnabled) root.strokeEnabled = true;
			root.stroke = wireColor;
		}*/
        /*
		else {
			
		}*/
		if (root.shadow) root.shadow = null;
        if (root.opacity != 0){
            root.opacity = 0.1;
        }
	}
}

function newRect(width, height){
	const newElement = new Rectangle();
	newElement.width = width;
	newElement.height = height;
    newElement.fill = wireColor;
    newElement.stroke = null;
    newElement.setAllCornerRadii(4);
    return newElement;
}

function newCircle(d){
    const newElement = new Ellipse();
	newElement.radiusX = d/2;
	newElement.radiusY = d/2;
    newElement.fill = wireColor;
    return newElement;
}


module.exports = {
    commands: {
        wireframe: wireframeHandlerFunction,
        skeleton: skeletonHandleFunction,
        addCorner: addCornerHandlerFunction
    }
};
