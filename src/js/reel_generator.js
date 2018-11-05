class CookieUtils {
    static setCookie(name, val) {
        const date = new Date();
        const value = val;
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    }
    static getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }
    static deleteCookie(name) {
        const date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
    }
}
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
        this.sortedIconDataArray = new Array(length);
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
            if (this.sortedIconDataArray[index] === null ||
                this.sortedIconDataArray[index] === undefined) {
                continue;
            }
            if (this.sortedIconDataArray[index].iconInfo.IsSameIcon(newIconInfo, false)) {
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
        return this.sortedIconDataArray;
    }
    SetIconInIndex(iconInfo, currentIndex, decereaseRemainCount) {
        if (this.sortedIconDataArray[currentIndex] != null) {
            console.log("seticoninIndex erreor position " + currentIndex + "is not null ");
        }
        this.sortedIconDataArray[currentIndex] = new Icon(iconInfo, currentIndex, this.index);
        if (decereaseRemainCount) {
            iconInfo.remainCount--;
        }
    }
    FindNextIcon(currentIndex) {
        if (currentIndex === this.length)
            return true;
        let isSuccessed = false;
        if (this.sortedIconDataArray[currentIndex] == null) {
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
                this.sortedIconDataArray[currentIndex] = null;
            }
        }
        else {
            isSuccessed = this.FindNextIcon(currentIndex + 1);
        }
        return isSuccessed;
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
        for (let i = 0; i < this.ReelInfoArray.length; i++) {
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
    AddIconInfo(reelIndex, infos) {
        if (this.ReelInfoArray.length >= reelIndex) {
            console.error("ReelInfoArray length is greater than input reel Index");
            return;
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
function makeReelInfoInputUi() {
    const reelCount = parseInt(document.getElementById("reel_count_input").value);
    const reelHeight = parseInt(document.getElementById("reel_height_input").value);
    const reelDisplayHeight = parseInt(document.getElementById("reel_display_height_input").value);
    const iconCount = parseInt(document.getElementById("icon_count_input").value);
    if (m_ElemenetCreator == null)
        m_ElemenetCreator = new Dynamically_create_element();
    if (m_ReelGenerator == null)
        m_ReelGenerator = new ReelGenerator(reelCount, reelHeight, reelDisplayHeight, iconCount);
    let reelParent = document.getElementById("reel_gen_div");
    for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {
        const reelUl = m_ElemenetCreator.CreateElementWithAttribute("ul", [["id", reelIndex == -1 ? "iconIndexInfos" : "reel_" + reelIndex]], () => { return reelParent; });
        const label = m_ElemenetCreator.CreateElementWithAttribute("label", [["id", "reel_+label_" + reelIndex]], () => { return reelUl; });
        label.innerText = reelIndex == -1 ? "iconIndex" : "reel" + reelIndex;
        const iconInputArray = m_ElemenetCreator.CreateManyElementWithAttribute("input", [["type", "number"]], () => { return reelUl; }, iconCount, (iconIndex) => getReelIconElementName(reelIndex, iconIndex));
        iconInputArray.forEach((iconInput, iconIndex) => iconInput.setAttribute("value", reelIndex == -1 ? (iconIndex + 1).toString() : "0"));
        if (reelIndex != -1) {
            const iconTotalCountLabel = m_ElemenetCreator.CreateElementWithAttribute("label", null, function () { return reelUl; });
            const onChangeEachIconCountFunc = (reelIndex) => { iconTotalCountLabel.innerText = " total count : " + CalculateReelTotalIconCount(reelIndex).toString(); };
            iconInputArray.forEach((iconInput) => iconInput.addEventListener("change", (ev) => onChangeEachIconCountFunc(parseElementNameToReelIconIndex(ev.target.id).reel_index)));
        }
    }
}
window.onload = () => {
    const addReelButton = document.getElementById('addReelButton');
    addReelButton.onclick = makeReelInfoInputUi;
    var ReelGeneratorButton = document.getElementById('ReelGeneratorButton');
    ReelGeneratorButton.onclick = function () {
        if (m_ElemenetCreator == null)
            return;
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
            for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
                let reelIconCountInput = m_ElemenetCreator.m_CreatedElementMap[getReelIconElementName(reelIndex, iconIndex)];
                if (reelIconCountInput != null && reelIconCountInput != undefined) {
                    let value = parseInt(reelIconCountInput.value);
                }
                else {
                    console.error(reelIndex + ", " + iconIndex + " input is not founded");
                }
            }
        }
    };
    var saveButton = document.getElementById('saveButton');
};
//# sourceMappingURL=reel_generator.js.map