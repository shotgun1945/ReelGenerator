class Icon {
    constructor(iconInfo, dataIndex, reelIndex) {
        this.iconInfo = iconInfo;
        this.dataIndex = dataIndex;
        this.reelIndex = reelIndex;
    }
    IsSameIcon(tartIcon) {
        return this.iconInfo.IsSameIcon(tartIcon.iconInfo, false);
    }
}
class IconInfo {
    constructor(iconId, maxCount, blockdSameDisplay = false, iconFixposition = -1, stackCount = 1) {
        this.iconId = iconId;
        this.maxCount = maxCount;
        this.blockdSameDisplay = blockdSameDisplay;
        this.iconFixposition = iconFixposition;
        this.stackCount = stackCount;
        this.remainCount = 0;
        this.remainCount = maxCount;
        if (iconFixposition >= 0 && maxCount != stackCount) {
            throw "1스택으로 존재할때만 fixposition이 작동합니다.";
        }
    }
    IsSameIcon(targetIcon, compareStack = false) {
        return (this.iconId === targetIcon.iconId &&
            (!compareStack || this.stackCount === targetIcon.stackCount));
    }
    IsThisIcon(iconId, stackCount) {
        return this.iconId === iconId && this.stackCount === stackCount;
    }
}
class Reel {
    constructor(index, length, reelDisplayHeight) {
        this.index = index;
        this.length = length;
        this.reelDisplayHeight = reelDisplayHeight;
        this._sortedIconDataArray = new Array(length);
        this.notSoredIconDataArray = new Array(length);
        this.IconInfoArray = new Array();
    }
    GetIconInfoByIconId(iconId) {
        let result = null;
        for (let index = 0; index < this.notSoredIconDataArray.length; index++) {
            const element = this.notSoredIconDataArray[index];
            if (element.iconInfo.iconId === iconId) {
                result = element.iconInfo;
                break;
            }
        }
        return result;
    }
    get SortedIconDataArray() {
        return this._sortedIconDataArray;
    }
    clearIconInfo() {
        this.IconInfoArray.length = 0;
    }
    setIconInfoArray(iconInfos) {
        iconInfos.forEach(iconInfo => {
            const sameIcon = this.IconInfoArray.find(element => element.IsSameIcon(iconInfo, true));
            if (sameIcon != null) {
                return;
            }
            if (iconInfo.iconFixposition >= 0) {
                const fixPosition = iconInfo.iconFixposition;
                this.SetIconInIndex(iconInfo, fixPosition, true);
            }
            this.IconInfoArray.push(iconInfo);
        });
    }
    isDuplicated(newIconInfo, currentIndex) {
        let result = false;
        let checkLength = 1;
        if (newIconInfo.blockdSameDisplay) {
            checkLength = this.reelDisplayHeight;
        }
        for (let i = -checkLength; i <= checkLength; i++) {
            let index = CalculateIndexWithOffset(currentIndex, i, this.length);
            if (index === currentIndex) {
                continue;
            }
            if (this._sortedIconDataArray[index] === null ||
                this._sortedIconDataArray[index] === undefined) {
                continue;
            }
            if (this._sortedIconDataArray[index].iconInfo.IsSameIcon(newIconInfo, false)) {
                result = true;
                break;
            }
        }
        return result;
    }
    GetNextList(currentIndex) {
        const resultArray = new Array();
        this.IconInfoArray.forEach(element => {
            if (element.remainCount <= 0) {
                return;
            }
            if (!this.isDuplicated(element, currentIndex)) {
                resultArray.push(element);
            }
        });
        let loopCount = resultArray.length * 10;
        for (let index = 0; index < loopCount; index++) {
            const randomIndex = Math.round(Math.random() * 10000) % resultArray.length;
            const temp = resultArray[randomIndex];
            resultArray[randomIndex] = resultArray[0];
            resultArray[0] = temp;
        }
        return resultArray;
    }
    generator() {
        let totalIconCount = 0;
        this.IconInfoArray.forEach(element => (totalIconCount += element.maxCount));
        if (totalIconCount === this.length) {
            this.FindNextIcon(0);
        }
        else {
            throw "IconCount is invalid : totalIconCOunt " +
                totalIconCount +
                " != length + " +
                length;
        }
        return this._sortedIconDataArray;
    }
    SetIconInIndex(iconInfo, currentIndex, decereaseRemainCount) {
        if (this._sortedIconDataArray[currentIndex] != null) {
            console.log("seticoninIndex erreor position " + currentIndex + "is not null ");
        }
        this._sortedIconDataArray[currentIndex] = new Icon(iconInfo, currentIndex, this.index);
        if (decereaseRemainCount) {
            iconInfo.remainCount--;
        }
    }
    FindNextIcon(currentIndex) {
        if (currentIndex === this.length)
            return true;
        let isSuccessed = false;
        if (this._sortedIconDataArray[currentIndex] == null) {
            const currentlist = this.GetNextList(currentIndex);
            console.log(currentIndex, " currentlist : ", PrintIconInfoArray(currentlist));
            for (let i = 0; i < currentlist.length; i++) {
                const element = currentlist[i];
                this.SetIconInIndex(element, currentIndex, true);
                isSuccessed = this.FindNextIcon(currentIndex + 1);
                if (isSuccessed === true) {
                    break;
                }
                else {
                    element.remainCount++;
                }
            }
            if (!isSuccessed) {
                this._sortedIconDataArray[currentIndex] = null;
            }
        }
        else {
            isSuccessed = this.FindNextIcon(currentIndex + 1);
        }
        return isSuccessed;
    }
    GetIconString() {
        return PrintIconArray(this._sortedIconDataArray);
    }
    ClearGeneratedReelIconArray() {
        this._sortedIconDataArray.length = 0;
    }
}
function PrintIconArray(array) {
    let resultString = "";
    array.forEach(element => {
        resultString += element.iconInfo.iconId + ", ";
    });
    return resultString;
}
function PrintIconInfoArray(array) {
    let resultString = "";
    array.forEach(element => {
        resultString += element.iconId + ", ";
    });
    return resultString;
}
class ReelGenerator {
    constructor(_reelCount, _reelHeight, _reelDisplayHeight, _iconCount) {
        this._reelCount = _reelCount;
        this._reelHeight = _reelHeight;
        this._reelDisplayHeight = _reelDisplayHeight;
        this._iconCount = _iconCount;
        this.ReelInfoArray = new Array();
        for (let i = 0; i < _reelCount; i++) {
            this.ReelInfoArray.push(new Reel(i, _reelHeight, _reelDisplayHeight));
        }
    }
    get iconCount() {
        return this._iconCount;
    }
    get reelCount() {
        return this._reelCount;
    }
    set reelCount(value) {
        if (value > 0)
            this._reelCount = value;
    }
    SetIconInfo(reelIndex, infos, overwrite) {
        if (this.ReelInfoArray.length <= reelIndex) {
            console.error("ReelInfoArray length is greater than input reel Index / length : " + this.ReelInfoArray.length + ", reelIndex : " + reelIndex);
            return;
        }
        if (overwrite) {
            this.ReelInfoArray[reelIndex].clearIconInfo();
        }
        this.ReelInfoArray[reelIndex].setIconInfoArray(infos);
    }
    testMain() {
        const reel = new Reel(0, 30, 3);
        const iconInfo1 = new IconInfo(1, 1, true, 0);
        const iconInfo2 = new IconInfo(2, 5);
        const iconInfo3 = new IconInfo(3, 8, false, -1);
        const iconInfo4 = new IconInfo(4, 8, false, -1);
        const iconInfo5 = new IconInfo(5, 8, false, -1);
        const iconInfoArray = [iconInfo1, iconInfo2, iconInfo3, iconInfo4, iconInfo5];
        reel.setIconInfoArray(iconInfoArray);
        let result = reel.generator();
        console.log(PrintIconArray(result));
        this.VerrifyResult(result, iconInfoArray);
    }
    generator() {
        this.ReelInfoArray.forEach((reel) => {
            reel.ClearGeneratedReelIconArray();
            reel.generator();
        });
    }
    getAllIconInfo() {
        return this.ReelInfoArray.map(reel => { return reel.SortedIconDataArray; });
    }
    geAllIconInfoString() {
        let resultString = "";
        this.ReelInfoArray.forEach(reel => {
            resultString += reel.GetIconString();
            resultString += "<br/>";
        });
        return resultString;
    }
    VerrifyResult(result, iconInfoArray) {
        let index = 0;
        while (index < result.length) {
            const icon = result[index];
            let stackCount = 1;
            while (index + stackCount < result.length) {
                if (result[index + stackCount].IsSameIcon(icon)) {
                    stackCount++;
                }
                else {
                    break;
                }
            }
            let iconInfo = null;
            iconInfoArray.forEach(element => {
                element.IsSameIcon(icon.iconInfo, true);
                iconInfo = element;
            });
            if (iconInfo === null) {
                throw "Icon Info is Not Founded " + index + ", " + icon.iconInfo;
            }
            for (let stackIndex = 1; stackIndex < iconInfo.stackCount; stackIndex++) {
                const element = result[index + stackIndex];
                if (!element.IsSameIcon(icon)) {
                    throw "Stack Failed " + index + ", " + icon.iconInfo;
                }
            }
            if (icon.iconInfo.blockdSameDisplay) {
                for (let displayHeight = -this._reelDisplayHeight + 1; displayHeight < this._reelDisplayHeight; displayHeight++) {
                    if (displayHeight == 0)
                        continue;
                    let displayIndex = CalculateIndexWithOffset(index, displayHeight, this._reelDisplayHeight);
                    const element = result[displayIndex];
                    if (element.IsSameIcon(icon)) {
                        throw "BlockIcon Failed " + index + ", " + icon.iconInfo;
                    }
                }
            }
            index += stackCount;
        }
        console.log("Completed Verification");
    }
}
function CalculateIndexWithOffset(currentIndex, offset, maxValue) {
    let index = currentIndex + offset;
    if (index < 0) {
        index += maxValue;
    }
    if (index >= maxValue) {
        index -= maxValue;
    }
    return index;
}
let m_ElemenetCreator = null;
let m_ReelGenerator = null;
let m_inputArrayWillBeSaved = new Array();
class Dynamically_create_element {
    constructor() {
        this.m_CreatedElementMap = new Map();
    }
    CreateManyElementWithAttribute(type, attribute, getParent, elementCount, getId) {
        const resultArray = new Array();
        for (let index = 0; index < elementCount; index++) {
            if (getId != null)
                attribute.push(["id", getId(index)]);
            resultArray.push(this.CreateElementWithAttribute(type, attribute, getParent));
        }
        return resultArray;
    }
    CreateElementWithAttribute(type, attribute, getParent) {
        const element = document.createElement(type);
        if (attribute != null) {
            attribute.forEach((atSet, index) => element.setAttribute(atSet[0], atSet[1]));
            this.m_CreatedElementMap.set(element.id, element);
        }
        if (getParent != null)
            getParent().appendChild(element);
        return element;
    }
}
function MakeSaveName(element) {
    return { key: element.id, value: element.value };
}
function FindAndApplyValue(data) {
    const input = document.getElementById(data.key);
    if (input === null || input === undefined)
        return;
    input.value = data.value;
}
function getReelIconElementName(reel_index, icon_index) {
    return reel_index + "_" + icon_index;
}
function parseElementNameToReelIconIndex(id) {
    let parsedNumbers = id.split('_').map(s => parseInt(s));
    return { reel_index: parsedNumbers[0], icon_index: parsedNumbers[1] };
}
function getReelIconElementByIndexInfo(reelIndex, iconIndex) {
    const key = getReelIconElementName(reelIndex, iconIndex);
    return m_ElemenetCreator.m_CreatedElementMap.get(key);
}
function GetValueAboutCreatedInputElement(reelIndex, iconIndex) {
    const element = getReelIconElementByIndexInfo(reelIndex, iconIndex);
    if (element != undefined || element != null) {
        return element.value;
    }
    else {
        throw "GetValueAboutCreatedInputElement :: finded element(reelIndex : " + reelIndex + ", iconIndex : " + iconIndex + ") is " + element;
    }
}
function CalculateReelTotalIconCount(reelIndex) {
    let result = 0;
    for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
        const element = GetValueAboutCreatedInputElement(reelIndex, iconIndex);
        result += parseInt(element);
    }
    return result;
}
function CheckLocalStorage() {
    if (Storage === undefined)
        throw "Storage is undefined";
    let savedData = localStorage.getItem("reel");
    if (savedData === null || savedData === undefined)
        return true;
    return false;
}
function makeReelInfoInputUi(inputData = null) {
    window.onbeforeunload = function () {
        return "";
    };
    m_inputArrayWillBeSaved.length = 0;
    const idArray = ["reel_count_input", "reel_height_input", "reel_display_height_input", "icon_count_input"];
    const valueArray = idArray.map((value, index) => {
        console.log(value);
        const element = document.getElementById(value);
        m_inputArrayWillBeSaved.push(element);
        return parseInt(element.value);
    });
    const reelCount = valueArray[0];
    const iconCount = valueArray[1];
    if (m_ElemenetCreator == null)
        m_ElemenetCreator = new Dynamically_create_element();
    if (m_ReelGenerator == null)
        m_ReelGenerator = new ReelGenerator(valueArray[0], valueArray[1], valueArray[2], valueArray[3]);
    let reelParent = document.getElementById("reel_info_div");
    for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {
        const reelUl = m_ElemenetCreator.CreateElementWithAttribute("ul", [["id", reelIndex == -1 ? "iconIndexInfos" : "reel_" + reelIndex]], () => { return reelParent; });
        const label = m_ElemenetCreator.CreateElementWithAttribute("label", [["id", "reel_+label_" + reelIndex]], () => { return reelUl; });
        label.innerText = reelIndex == -1 ? "iconIndex" : "reel" + reelIndex;
        const iconInputArray = m_ElemenetCreator.CreateManyElementWithAttribute("input", [["type", "number"]], () => { return reelUl; }, iconCount, (iconIndex) => getReelIconElementName(reelIndex, iconIndex));
        iconInputArray.forEach((iconInput, iconIndex) => {
            let defaultvalue = inputData === null ? 0 : inputData.find(value => { return value.key === iconInput.id; }).value;
            iconInput.setAttribute("value", reelIndex == -1 ? (iconIndex + 1).toString() : defaultvalue);
            m_inputArrayWillBeSaved.push(iconInput);
        });
        if (reelIndex != -1) {
            const iconTotalCountLabel = m_ElemenetCreator.CreateElementWithAttribute("label", null, function () { return reelUl; });
            const onChangeEachIconCountFunc = (reelIndex) => {
                const totalText = " total count : " + CalculateReelTotalIconCount(reelIndex).toString();
                console.log(totalText);
                iconTotalCountLabel.innerText = totalText;
            };
            iconInputArray.forEach((iconInput) => iconInput.addEventListener("change", (ev) => onChangeEachIconCountFunc(parseElementNameToReelIconIndex(ev.target.id).reel_index)));
            onChangeEachIconCountFunc(reelIndex);
        }
    }
}
window.onload = () => {
    const addReelButton = document.getElementById('addReelButton');
    addReelButton.onclick = e => makeReelInfoInputUi();
    var ReelGeneratorButton = document.getElementById('ReelGeneratorButton');
    ReelGeneratorButton.onclick = function () {
        if (m_ElemenetCreator == null)
            return;
        let iconInfoMap = new Array();
        let iconIndexArray = new Array();
        for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
            let iconId = parseInt(getReelIconElementByIndexInfo(-1, iconIndex).value);
            iconIndexArray.push(iconId);
        }
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
            let iconInfoArray = new Array();
            for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
                let reelIconCountInput = getReelIconElementByIndexInfo(reelIndex, iconIndex);
                if (reelIconCountInput != null && reelIconCountInput != undefined) {
                    let iconCount = parseInt(reelIconCountInput.value);
                    iconInfoArray.push(new IconInfo(iconIndexArray[iconIndex], iconCount));
                }
                else {
                    console.error(reelIndex + ", " + iconIndex + " input is not founded");
                }
            }
            iconInfoMap.push(iconInfoArray);
            m_ReelGenerator.SetIconInfo(reelIndex, iconInfoArray, true);
        }
        console.log(iconInfoMap);
        m_ReelGenerator.generator();
        let targetDiv = document.getElementById("reel_gen_div");
        targetDiv.innerHTML = "";
        const allReelIconInfo = m_ReelGenerator.getAllIconInfo();
        allReelIconInfo.forEach((reelIcon, reelIndex) => {
            const parentDiv = m_ElemenetCreator.CreateElementWithAttribute("div", null, () => { return targetDiv; });
            reelIcon.forEach(icon => {
                const element = m_ElemenetCreator.CreateElementWithAttribute("div", [["draggable", "true"]], () => { return parentDiv; });
                element.style.display = "inline-block";
                element.style.width = "20px";
                element.style.height = "20px";
                element.style.margin = "1px";
                element.style.border = "1px solid black";
                element.innerHTML = icon.iconInfo.iconId.toString();
                element.click = function () {
                };
            });
        });
        targetDiv.innerHTML += m_ReelGenerator.geAllIconInfoString();
        ;
    };
    var saveButton = document.getElementById('saveButton');
    saveButton.onclick = function () {
        if (Storage !== undefined) {
            const saveARray = m_inputArrayWillBeSaved.map(value => { return MakeSaveName(value); });
            let targetDiv = document.getElementById("reel_gen_div");
            saveARray.push({ key: targetDiv.id, value: targetDiv.innerHTML });
            console.log(saveARray);
            const jsonData = JSON.stringify(saveARray);
            console.log(jsonData);
            localStorage.setItem("reel", jsonData);
        }
    };
    var loadButton = document.getElementById("loadButton");
    loadButton.onclick = function () {
        if (Storage !== undefined) {
            if (!CheckLocalStorage()) {
                let savedData = localStorage.getItem("reel");
                const array = JSON.parse(savedData);
                console.log(array);
                array.forEach(element => {
                    FindAndApplyValue(element);
                });
                makeReelInfoInputUi(array);
                let targetData = array.find(data => {
                    return "reel_gen_div" === data.key;
                });
                if (targetData !== undefined && targetData !== null) {
                    let targetDiv = document.getElementById("reel_gen_div");
                    targetDiv.innerHTML = targetData.value;
                }
            }
        }
    };
};
//# sourceMappingURL=reel_generator.js.map