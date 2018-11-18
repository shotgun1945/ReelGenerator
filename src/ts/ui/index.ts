let m_ElemenetCreator:Dynamically_create_element = null;
let m_ReelGenerator:ReelGenerator = null;
let m_inputArrayWillBeSaved:Array<HTMLInputElement> = new Array<HTMLInputElement>();
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

function MakeSaveName(element:HTMLInputElement):{key:string, value:string}
{
    return {key:element.id, value:element.value};
}

function FindAndApplyValue(data:{key:string, value:string})
{
    const input = <HTMLInputElement>document.getElementById(data.key);
    if(input === null || input === undefined) return;
    input.value = data.value;
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

function CheckLocalStorage():Boolean
{
    if(Storage === undefined) throw "Storage is undefined";
    let savedData = localStorage.getItem("reel");
    if(savedData === null || savedData === undefined) return true;
    return false;
}

function makeReelInfoInputUi(inputData:any = null)
{
    window.onbeforeunload = function() {
        return "";
    }   

    m_inputArrayWillBeSaved.length = 0;
    const idArray = ["reel_count_input", "reel_height_input", "reel_display_height_input", "icon_count_input"];
    const valueArray = idArray.map(
        (value:string, index:number)=>{
            console.log(value);
            
            const element = <HTMLInputElement>document.getElementById(value);
            m_inputArrayWillBeSaved.push(element);
            return parseInt(element.value);
        }
    )
    const reelCount = valueArray[0];
    const iconCount = valueArray[1];
        
    if(m_ElemenetCreator == null) m_ElemenetCreator = new Dynamically_create_element();
    if(m_ReelGenerator == null) m_ReelGenerator = new ReelGenerator(valueArray[0], valueArray[1], valueArray[2], valueArray[3] );
    
    let reelParent = document.getElementById("reel_info_div");
    for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {

        const reelUl = m_ElemenetCreator.CreateElementWithAttribute("ul", [["id", reelIndex == -1 ? "iconIndexInfos" : "reel_"+reelIndex ]], ()=>{return reelParent} );
        const label = m_ElemenetCreator.CreateElementWithAttribute("label", [["id", "reel_+label_" + reelIndex]], ()=>{return reelUl;});
        label.innerText = reelIndex == -1 ? "iconIndex" : "reel" + reelIndex;

        const iconInputArray = m_ElemenetCreator.CreateManyElementWithAttribute("input", [["type", "number"]], ()=> { return reelUl; }, iconCount, (iconIndex)=>getReelIconElementName(reelIndex, iconIndex));
        iconInputArray.forEach((iconInput, iconIndex)=>
        {
            let defaultvalue = inputData === null? 0 : inputData.find(value=>{return value.key === iconInput.id}).value;
            iconInput.setAttribute("value", reelIndex == -1 ? (iconIndex+1).toString(): defaultvalue);
            m_inputArrayWillBeSaved.push(<HTMLInputElement>iconInput);
        });
        // ["value", defaultValue.toString()],
        if(reelIndex != -1 ) {
            const iconTotalCountLabel = m_ElemenetCreator.CreateElementWithAttribute("label", null, function():HTMLElement { return reelUl; });
            const onChangeEachIconCountFunc = (reelIndex:number)=>{
                const totalText = " total count : "+CalculateReelTotalIconCount(reelIndex).toString();
                console.log(totalText);
                iconTotalCountLabel.innerText = totalText;
            }
            iconInputArray.forEach((iconInput)=>iconInput.addEventListener("change", (ev:Event) => onChangeEachIconCountFunc( parseElementNameToReelIconIndex( (<HTMLElement>ev.target).id).reel_index)));
            onChangeEachIconCountFunc(reelIndex);
        }
    }
}

window.onload = () =>
{
    const addReelButton = document.getElementById('addReelButton');
    
    addReelButton.onclick = e=>makeReelInfoInputUi();

    var ReelGeneratorButton = document.getElementById('ReelGeneratorButton');
    ReelGeneratorButton.onclick = function():void
    {
        
        if(m_ElemenetCreator == null) return;
        let iconInfoMap:Array<Array<IconInfo>> = new Array<Array<IconInfo>>();
        let iconIndexArray:Array<number> = new Array<number>();
        for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
            let iconId = parseInt((<HTMLInputElement>getReelIconElementByIndexInfo(-1, iconIndex)).value);
            iconIndexArray.push(iconId);
        }
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
            let iconInfoArray:Array<IconInfo> = new Array<IconInfo>();
            for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
                let reelIconCountInput:HTMLInputElement = <HTMLInputElement>getReelIconElementByIndexInfo(reelIndex, iconIndex);
                if (reelIconCountInput != null && reelIconCountInput != undefined) {
                    
                    let iconCount = parseInt(reelIconCountInput.value);
                    iconInfoArray.push(new IconInfo(iconIndexArray[iconIndex], iconCount));
                }
                else{
                    console.error(reelIndex + ", " + iconIndex +" input is not founded");
                }
            }
            iconInfoMap.push(iconInfoArray);
            
            m_ReelGenerator.SetIconInfo(reelIndex, iconInfoArray, true);
        }

        console.log(iconInfoMap);

        let targetDiv = document.getElementById("reel_gen_div");
        targetDiv.innerHTML = m_ReelGenerator.generator();
    };

    var saveButton = document.getElementById('saveButton');
    saveButton.onclick = function(){
        if(Storage !== undefined)
        {
            const saveARray = m_inputArrayWillBeSaved.map(value=>{ return MakeSaveName(value);})
            let targetDiv = document.getElementById("reel_gen_div");
            saveARray.push({key:targetDiv.id, value:targetDiv.innerHTML});
            console.log(saveARray);
            const jsonData = JSON.stringify(saveARray);
            console.log(jsonData);
            localStorage.setItem("reel", jsonData);
        }
    };

    var loadButton = document.getElementById("loadButton");
    loadButton.onclick = function()
    {
        if(Storage !== undefined)
        {
            if(!CheckLocalStorage())
            {
                let savedData = localStorage.getItem("reel");
                const array = JSON.parse(savedData);
                console.log(array);
                array.forEach(element => {
                    FindAndApplyValue(element);
                });
                makeReelInfoInputUi(array);
                
                let targetData = array.find(data=>{
                    return "reel_gen_div" === data.key;
                })
                if(targetData !== undefined && targetData!== null)
                {
                    let targetDiv = document.getElementById("reel_gen_div");
                    targetDiv.innerHTML = targetData.value;
                }
    
            }
        }
    }
};