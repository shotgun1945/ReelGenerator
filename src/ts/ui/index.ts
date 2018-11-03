class Dynamically_create_element
{
    private htmlelent:HTMLElement;
    public m_CreatedElementMap:Object = new Object();
    public Create_Element(type:string, attribute:[], parentName:string, elementCount:number):HTMLElement{        
        let parent = document.getElementById(parentName);
        let element = document.createElement(type);
        element.setAttribute("type", attribute["type"]);
        element.setAttribute("value", attribute["value"]);
        element.setAttribute("id", attribute["id"]);
        parent.appendChild(element);
        this.m_CreatedElementMap[attribute["id"]] = element;
        return element;
    }
    public Create_Element_FindFunction(type:string, attribute:string[], getParent:Function, elementCount:number):HTMLElement{        
        let parent = getParent();
        let element = document.createElement(type);
        element.setAttribute("type", attribute[0]);
        element.setAttribute("value", attribute[1]);
        element.setAttribute("id", attribute[2]);
        parent.appendChild(element);
        this.m_CreatedElementMap[attribute[2]] = element;
        return element;
    }
}

function getReelIconElementName(reel_index:number, icon_index:number):string
{
    return reel_index + "_" + icon_index;
}

let m_creatElement:Dynamically_create_element = null;
let m_ReelGenerator:ReelGenerator = null;
window.onload = () =>
{
    let addReelButton = document.getElementById('addReelButton');
    
    addReelButton.onclick = function (){
        let reelCount = parseInt((<HTMLInputElement>document.getElementById("reel_count_input")).value);
        let reelHeight = parseInt((<HTMLInputElement>document.getElementById("reel_height_input")).value);
        let reelDisplayHeight = parseInt((<HTMLInputElement>document.getElementById("reel_display_height_input")).value);
        let iconCount = parseInt((<HTMLInputElement>document.getElementById("icon_count_input")).value);
        if(m_creatElement == null) m_creatElement = new Dynamically_create_element();
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

            let label = m_creatElement.Create_Element_FindFunction("label", ["", "", "reel_label_" + reelIndex], function():HTMLElement { return reelUl; }, 1);
            if (reelIndex == -1) {
                label.innerText = "iconIndex";
            }
            else{
                label.innerText = "reel" + reelIndex;
            }
            
            for (let iconIndex = 0; iconIndex < iconCount; iconIndex++) {
                let defaultValue = 0;
                if(reelIndex == -1) defaultValue = iconIndex + 1;
                let iconLabel:HTMLInputElement = <HTMLInputElement>m_creatElement.Create_Element_FindFunction("input", ["number", defaultValue.toString(), getReelIconElementName(reelIndex, iconIndex)], function():HTMLElement { return reelUl; }, 1);
                // if(reelIndex != -1) iconLabel.onchange = function():void{console.log(iconLabel.value);};
                iconLabel.addEventListener("change",function( ev:Event):any{console.log(this.value + ","+this.id); } );
            }

            reelParent.appendChild(reelUl);
        }
    };

    var runButton = document.getElementById('runButton');
    runButton.onclick = function():void
    {
        if(m_creatElement == null) return;
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
          for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
            let reelIconCountInput:HTMLInputElement = m_creatElement.m_CreatedElementMap[getReelIconElementName(reelIndex, iconIndex)];
            if (reelIconCountInput !== null && reelIconCountInput !== undefined) {
              let value = parseInt(reelIconCountInput.value);
            //   new IconInfo(iconIndex, )
            //   m_ReelGenerator.ReelInfoArray[reelIndex].;
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