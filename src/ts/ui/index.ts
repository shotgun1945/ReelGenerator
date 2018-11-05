let m_ElemenetCreator:Dynamically_create_element = null;
let m_ReelGenerator:ReelGenerator = null;

class Dynamically_create_element
{
    public m_CreatedElementMap:Map<string, HTMLElement> = new Map<string, HTMLElement>();
    
    public CreateManyElementWithAttribute(type:string, attribute:[[string,string]], getParent:Function, elementCount:number, getId:Function):Array<HTMLElement>{        
        const resultArray:Array<HTMLElement> = new Array<HTMLElement>();
        for (let index = 0; index < elementCount; index++) {
            if(getId != null) attribute.push(["id", getId(index)]);

            resultArray.push(this.CreateElementWithAttribute(type, attribute, getParent));
        }

        return resultArray;
    }

    public CreateElementWithAttribute(type:string, attribute:[[string,string]], getParent:Function):HTMLElement{       
        const element = document.createElement(type);
        if(attribute != null)
        {
            attribute.forEach( (atSet,index)=>element.setAttribute(atSet[0], atSet[1]) );
            this.m_CreatedElementMap.set(element.id, element);
        }
        if(getParent != null) getParent().appendChild(element);
        
        return element;
    }
}

function getReelIconElementName(reel_index:number, icon_index:number):string
{
    return reel_index + "_" + icon_index;
}

function parseElementNameToReelIconIndex(id:string)
{
    let parsedNumbers = id.split('_').map(s=>parseInt(s));
    return {reel_index:parsedNumbers[0] , icon_index:parsedNumbers[1]};
}

function getReelIconElementByIndexInfo(reelIndex:number, iconIndex:number):HTMLElement
{
    const key = getReelIconElementName(reelIndex, iconIndex);
    return m_ElemenetCreator.m_CreatedElementMap.get(key);
}

function GetValueAboutCreatedInputElement(reelIndex:number, iconIndex:number):string
{
    const element:HTMLInputElement = <HTMLInputElement>getReelIconElementByIndexInfo(reelIndex, iconIndex);

    if(element != undefined || element != null){
        return element.value;
    }
    else{
        throw "GetValueAboutCreatedInputElement :: finded element(reelIndex : " + reelIndex + ", iconIndex : "+iconIndex+") is " + element;
    }
    
}

function CalculateReelTotalIconCount(reelIndex:number):number
{
    let result:number = 0;
    for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
        const element = GetValueAboutCreatedInputElement(reelIndex, iconIndex);
        result += parseInt(element);
    }

    return result;
}

function makeReelInfoInputUi()
{
    const reelCount = parseInt((<HTMLInputElement>document.getElementById("reel_count_input")).value);
    const reelHeight = parseInt((<HTMLInputElement>document.getElementById("reel_height_input")).value);
    const reelDisplayHeight = parseInt((<HTMLInputElement>document.getElementById("reel_display_height_input")).value);
    const iconCount = parseInt((<HTMLInputElement>document.getElementById("icon_count_input")).value);
    if(m_ElemenetCreator == null) m_ElemenetCreator = new Dynamically_create_element();
    if(m_ReelGenerator == null) m_ReelGenerator = new ReelGenerator(reelCount, reelHeight, reelDisplayHeight, iconCount );
    
    let reelParent = document.getElementById("reel_gen_div");
    for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {

        const reelUl = m_ElemenetCreator.CreateElementWithAttribute("ul", [["id", reelIndex == -1 ? "iconIndexInfos" : "reel_"+reelIndex ]], ()=>{return reelParent} );
        const label = m_ElemenetCreator.CreateElementWithAttribute("label", [["id", "reel_+label_" + reelIndex]], ()=>{return reelUl;});
        label.innerText = reelIndex == -1 ? "iconIndex" : "reel" + reelIndex;

        const iconInputArray = m_ElemenetCreator.CreateManyElementWithAttribute("input", [["type", "number"]], ()=> { return reelUl; }, iconCount, (iconIndex)=>getReelIconElementName(reelIndex, iconIndex));
        iconInputArray.forEach((iconInput, iconIndex)=>iconInput.setAttribute("value", reelIndex == -1 ? (iconIndex+1).toString(): "0"));
        // ["value", defaultValue.toString()],
        if(reelIndex != -1 ) {
            const iconTotalCountLabel = m_ElemenetCreator.CreateElementWithAttribute("label", null, function():HTMLElement { return reelUl; });
            const onChangeEachIconCountFunc = (reelIndex:number)=>{iconTotalCountLabel.innerText = " total count : "+CalculateReelTotalIconCount(reelIndex).toString()}
            iconInputArray.forEach((iconInput)=>iconInput.addEventListener("change", (ev:Event) => onChangeEachIconCountFunc( parseElementNameToReelIconIndex( (<HTMLElement>ev.target).id).reel_index)));
            
        }
    }
}

window.onload = () =>
{
    const addReelButton = document.getElementById('addReelButton');
    
    addReelButton.onclick = makeReelInfoInputUi;

    var ReelGeneratorButton = document.getElementById('ReelGeneratorButton');
    ReelGeneratorButton.onclick = function():void
    {
        if(m_ElemenetCreator == null) return;
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
          for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
            let reelIconCountInput:HTMLInputElement = m_ElemenetCreator.m_CreatedElementMap[getReelIconElementName(reelIndex, iconIndex)];
            if (reelIconCountInput != null && reelIconCountInput != undefined) {
                let value = parseInt(reelIconCountInput.value);
            }
            else{
                console.error(reelIndex + ", " + iconIndex +" input is not founded");
            }
          }
        }
    };

    var saveButton = document.getElementById('saveButton');
    // saveButton.onclick
};