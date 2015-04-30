//Author-Autodesk Inc.
//Description-Create a bottle.
/*globals adsk*/
(function () {

    "use strict";

    // scale of the bottle size
    var scale = 1.5;

    // unit - cm
    var height = 21;
    var topWidth = 2.8;
    var topHight = 1.9;
    var bodyTopWidth = 0.4;
    var bottomWidth = 3.2;
    var upperArcCenterToTop = 4.5;
    var upperArcRadius = 16;
    var lowerArcRadius = 15;
    var filletRadius = 0.5;
    var thickness = 0.3;
    var threadPitch = 0.4;

    // used for direct modeling
    var upperArcMidPtXOffset = -0.18;
    var upperArcMidPtYOffset = -4.1;
    var upperArcEndPtXOffset = 0.46;
    var upperArcEndPtYOffset = -7.2;
    var lowerArcMidPtXOffsetFromOriginPt = 4.66;
    var lowerArcMidPtYOffsetFromOriginPt = 5.9;

    var bottomCenter = adsk.core.Point3D.create(0, 0, 0);
    var bottleMaterial = 'PrismMaterial-006';
    var bottleAppearance = 'Prism-154';
    var materialLibId = 'C1EEA57C-3F56-45FC-B8CB-A9EC46A9994C';
    var appearanceLibId = 'BA5EE55E-9982-449B-9D66-9F036540E140';

    var nearZero = 0.000001;
    var app = adsk.core.Application.get(), ui;
    if (app) {
        ui = app.userInterface;
    }

    var newComp;

    function createNewComponent() {
        // Get the active design.
        var product = app.activeProduct;
        var design = adsk.fusion.Design(product);
        var rootComp = design.rootComponent;
        var allOccs = rootComp.occurrences;
        var newOcc = allOccs.addNewComponent(adsk.core.Matrix3D.create());
        newComp = newOcc.component;
    }

    var createBottle = function(){
        var product = app.activeProduct;
        var design = adsk.fusion.Design.cast(product);
        var currentDesignType = design.designType;

        createNewComponent();
        if (!newComp) {
            ui.messageBox('New component failed to create', 'New Component Failed');
            adsk.terminate();
            return;
        }

        // add sketch
        var sketches = newComp.sketches;
        var sketch = sketches.add(newComp.xYConstructionPlane);

        // add sketch curves
        var sketchlines = sketch.sketchCurves.sketchLines;

        var endPt = bottomCenter.copy();//start from bottomCenter
        endPt.y = bottomCenter.y + height;
        var heightLine = sketchlines.addByTwoPoints(bottomCenter, endPt);

        endPt.x = endPt.x + topWidth;
        var topLine = sketchlines.addByTwoPoints(heightLine.endSketchPoint, endPt);

        endPt.y = endPt.y - topHight;
        var topHightLine = sketchlines.addByTwoPoints(topLine.endSketchPoint, endPt);

        endPt.x = endPt.x + bodyTopWidth;
        var topBodyLine = sketchlines.addByTwoPoints(topHightLine.endSketchPoint, endPt);

        var sketchArcs = sketch.sketchCurves.sketchArcs;

        var upperArc, ptOnArc, deltPos;
        if (currentDesignType === adsk.fusion.DesignTypes.DirectDesignType ) {
            endPt.x = topBodyLine.endSketchPoint.geometry.x + upperArcEndPtXOffset;
            endPt.y = topBodyLine.endSketchPoint.geometry.y + upperArcEndPtYOffset;
            ptOnArc = adsk.core.Point3D.create(topBodyLine.endSketchPoint.geometry.x + upperArcMidPtXOffset, topBodyLine.endSketchPoint.geometry.y + upperArcMidPtYOffset);
            upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt);

            endPt = bottomCenter.copy();
            endPt.x = bottomWidth;
            ptOnArc = adsk.core.Point3D.create(lowerArcMidPtXOffsetFromOriginPt, lowerArcMidPtYOffsetFromOriginPt);
        } else {
            deltPos = 0.1;
            endPt.x = topWidth + bodyTopWidth + bodyTopWidth;
            endPt.y = height / 2;
            ptOnArc = adsk.core.Point3D.create(endPt.x - deltPos, endPt.y + deltPos);
            upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt);

            endPt = bottomCenter.copy();
            endPt.x = bottomWidth;
            ptOnArc = adsk.core.Point3D.create(endPt.x + deltPos, endPt.y + deltPos);
            
        }
        var lowerArc = sketchArcs.addByThreePoints(upperArc.endSketchPoint, ptOnArc, endPt);
        var buttomLine = sketchlines.addByTwoPoints(lowerArc.startSketchPoint, heightLine.startSketchPoint);

        // add constraints
        heightLine.startSketchPoint.isFixed = true;
        var sketchConstraints = sketch.geometricConstraints;
        sketchConstraints.addHorizontal(buttomLine);
        sketchConstraints.addPerpendicular(buttomLine, heightLine);
        sketchConstraints.addPerpendicular(heightLine, topLine);
        sketchConstraints.addPerpendicular(topLine, topHightLine);
        sketchConstraints.addPerpendicular(topHightLine, topBodyLine);
        
        // add dimensions
        var sketchDims = sketch.sketchDimensions;
        
        var startPt = heightLine.startSketchPoint.geometry;
        endPt = heightLine.endSketchPoint.geometry;
        var textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.x = textPos.x - 1;
        sketchDims.addDistanceDimension(heightLine.startSketchPoint, heightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);
        
        startPt = topLine.startSketchPoint.geometry;
        endPt = topLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y + 1;
        sketchDims.addDistanceDimension(topLine.startSketchPoint, topLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);
        
        startPt = topHightLine.startSketchPoint.geometry;
        endPt = topHightLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.x = textPos.x + 1;
        sketchDims.addDistanceDimension(topHightLine.startSketchPoint, topHightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = topBodyLine.startSketchPoint.geometry;
        endPt = topBodyLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y + 1;
        sketchDims.addDistanceDimension(topBodyLine.startSketchPoint, topBodyLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = buttomLine.startSketchPoint.geometry;
        endPt = buttomLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y - 1;
        sketchDims.addDistanceDimension(buttomLine.startSketchPoint, buttomLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = topLine.endSketchPoint.geometry;
        endPt = upperArc.centerSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        if (currentDesignType === adsk.fusion.DesignTypes.DirectDesignType) {
            sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos);
        } else {
            var distDim = sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos);
            distDim.parameter.value = upperArcCenterToTop;

            startPt = upperArc.centerSketchPoint.geometry;
            textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0);
            var radialArc = sketchDims.addRadialDimension(upperArc, textPos);
            radialArc.parameter.value = upperArcRadius;

            startPt = lowerArc.centerSketchPoint.geometry;
            textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0);
            radialArc = sketchDims.addRadialDimension(lowerArc, textPos);
            radialArc.parameter.value = lowerArcRadius;
        }

        // create revolve
        var revolveFeats = newComp.features.revolveFeatures;
        
        var revolveInput = revolveFeats.createInput(sketch.profiles.item(0), heightLine, adsk.fusion.FeatureOperations.NewBodyFeatureOperation);
        revolveInput.setAngleExtent(true, adsk.core.ValueInput.createByReal(2 * Math.PI));
        var revolveFeat = revolveFeats.add(revolveInput);
        
        // create fillets
        var filletFeats = newComp.features.filletFeatures;
        
        // select the edges to do fillets
        var faces = revolveFeat.faces;
        var body = faces.item(0).body;
        var edgeCol = adsk.core.ObjectCollection.create();
        for(var j = 0; j < body.edges.count; j++){
            var edge = body.edges.item(j);
            var circle = edge.geometry;
            if(Math.abs(circle.radius - bottomWidth) < nearZero ||
               Math.abs(circle.radius - topWidth - bodyTopWidth) < nearZero){
                edgeCol.add(edge);
            }
        }
        
        var filletInput = filletFeats.createInput();
        filletInput.addConstantRadiusEdgeSet(edgeCol, adsk.core.ValueInput.createByReal(filletRadius), true);
        filletFeats.add(filletInput);
        
        // create shell
        var shellFeats = newComp.features.shellFeatures;
        
        // select the faces to remove
        var faceCol = adsk.core.ObjectCollection.create();
        for(var i = 0; i < faces.count; i++){
            // find the top face;
            var face = faces.item(i);
            if(face.geometry.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType){
                var edge0 = face.edges.item(0);
                if(edge0.geometry.center.isEqualTo(heightLine.endSketchPoint.worldGeometry)){
                    faceCol.add(face);
                    break;
                }
            }
        }
        
        var shellInput = shellFeats.createInput(faceCol);
        shellInput.insideThickness = adsk.core.ValueInput.createByReal(thickness);
        shellFeats.add(shellInput);
        
        // create thread
        var threadFeats = newComp.features.threadFeatures;
        
        // select the face to do thread
        var threadFace;
        for(var iF = 0; iF < faces.count; iF++){
            var faceTemp = faces.item(iF);

            var surf = faceTemp.geometry;
            if(surf.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType && Math.abs(surf.radius - topWidth) < nearZero){
                threadFace = faceTemp;
                break;
            }
        }
        
        var threadQuery = threadFeats.threadDataQuery;
        var threadType = threadQuery.defaultMetricThreadType; 
        var designation = {}; 
        var threadClass = {};
        threadQuery.recommendThreadData(topWidth * 2, false, threadType, designation, threadClass);
        
        // find closest thread pitch
        var threadInfo = threadFeats.createThreadInfo(false, threadType, designation.value, threadClass.value);
        var designations = threadQuery.allDesignations(threadType, threadInfo.threadSize);
        var minGap = Math.abs(threadInfo.threadPitch - threadPitch);
        for(var iDes = 0; iDes < designations.length; iDes++){
            var tempThreadInfo = threadFeats.createThreadInfo(false, threadType, designations[iDes], threadClass.value);
            var tempGap = Math.abs(tempThreadInfo.threadPitch - threadPitch);
            if(tempGap < minGap){
                threadInfo = tempThreadInfo;
                minGap = tempGap;
            }
        }
        
        var threadInput = threadFeats.createInput(threadFace, threadInfo);
        threadInput.isModeled = true;
        threadFeats.add(threadInput);
        
        // create scale
        var scaleFeats = newComp.features.scaleFeatures;

        var objCol = adsk.core.ObjectCollection.create();
        objCol.add(body);

        var scaleInput = scaleFeats.createInput(objCol, newComp.originConstructionPoint, adsk.core.ValueInput.createByReal(scale));
        scaleFeats.add(scaleInput);
        
        //set material
        var materialLibs = app.materialLibraries;
        var materials = materialLibs.itemById(materialLibId).materials;
        var appearances = materialLibs.itemById(appearanceLibId).appearances;
        
        body.material = materials.itemById(bottleMaterial);
        body.appearance = appearances.itemById(bottleAppearance);
        
        app.activeViewport.refresh();
    };
    
    try {
        if (adsk.debug === true) {
            /*jslint debug: true*/
            debugger;
            /*jslint debug: false*/
        }
        
        createBottle();
    }
    catch(e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    }
    
    adsk.terminate();
}());
