class Dynamically_create_element
{
    public m_CreatedElementMap:Map<string, HTMLElement> = new Map<string, HTMLElement>();
    
    public CreateElementWithAttributeMap(type:string, attribute:Map<string, string>, getParent:Function, elementCount:number):HTMLElement{        
        const element = document.createElement(type);
        console.log(attribute);
        if(attribute != null)
        {
            attribute.forEach( (value, key)=>element.setAttribute(key, value) );
            this.m_CreatedElementMap.set(attribute.get("id"), element);
        }
        this.m_CreatedElementMap.set("test", null);
        if(getParent != null) getParent().appendChild(element);
        console.log(this.m_CreatedElementMap);
        
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

    if(element != undefined || element != null)
    {
        return element.value;
    }
    else
    {
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


let m_ElemenetCreator:Dynamically_create_element = null;
let m_ReelGenerator:ReelGenerator = null;
window.onload = () =>
{
    const addReelButton = document.getElementById('addReelButton');
    
    addReelButton.onclick = function (){
        const reelCount = parseInt((<HTMLInputElement>document.getElementById("reel_count_input")).value);
        const reelHeight = parseInt((<HTMLInputElement>document.getElementById("reel_height_input")).value);
        const reelDisplayHeight = parseInt((<HTMLInputElement>document.getElementById("reel_display_height_input")).value);
        const iconCount = parseInt((<HTMLInputElement>document.getElementById("icon_count_input")).value);
        if(m_ElemenetCreator == null) m_ElemenetCreator = new Dynamically_create_element();
        if(m_ReelGenerator == null) m_ReelGenerator = new ReelGenerator(reelCount, reelHeight, reelDisplayHeight, iconCount );
        
        let reelParent = document.getElementById("reel_gen_div");
        for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {
            let reelUl = document.createElement("ul");
            let reelId:string
            if(reelIndex == -1) {
                reelId = "iconIndexInfos";
            }
            else {
                reelId = "reel_"+reelIndex;
            }
            reelUl.id = reelId;

            let label = m_ElemenetCreator.CreateElementWithAttributeMap("label", new Map<string, string>([["id", "reel_+label_" + reelIndex]]), null, 1);
            if (reelIndex == -1) {
                label.innerText = "iconIndex";
            }
            else{
                label.innerText = "reel" + reelIndex;
            }
            reelUl.appendChild(label);

            const iconTotalCountLabel = m_ElemenetCreator.CreateElementWithAttributeMap("label", null, function():HTMLElement { return reelUl; }, 1);
            
            const onChangeEachIconCountFunc = (reelIndex:number)=>{iconTotalCountLabel.innerText = CalculateReelTotalIconCount(reelIndex).toString()}
            for (let iconIndex = 0; iconIndex < iconCount; iconIndex++) {
                let defaultValue = 0;
                if(reelIndex == -1) defaultValue = iconIndex + 1;
                let iconLabel:HTMLInputElement = <HTMLInputElement>m_ElemenetCreator.CreateElementWithAttributeMap("input", 
                    new Map<string, string>([ ["type", "number"], ["value", defaultValue.toString()], ["id", getReelIconElementName(reelIndex, iconIndex)] ])
                    , function():HTMLElement { return reelUl; }, 1);
                // if(reelIndex != -1) iconLabel.onchange = function():void{console.log(iconLabel.value);};


                iconLabel.addEventListener("change", (ev:Event) => onChangeEachIconCountFunc( parseElementNameToReelIconIndex( (<HTMLElement>ev.target).id).reel_index));

            }

            reelUl.appendChild(iconTotalCountLabel);
            reelParent.appendChild(reelUl);
        }
    };

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
            else
            {
                console.error(reelIndex + ", " + iconIndex +" input is not founded");
            }

          }
        }
    };

    var saveButton = document.getElementById('saveButton');
    // saveButton.onclick
};