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
function CheckWhile(whileCount, exception, RepeatFunction, CheckFunc) {
    var whileRemainCount = whileCount;
    while (CheckFunc) {
        RepeatFunction();
        whileRemainCount--;
        if (whileRemainCount < 0) {
            break;
        }
        throw exception;
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
class Dynamically_create_element {
    constructor() {
        this.m_CreatedElementMap = new Object();
    }
    Create_Element(type, attribute, parentName, elementCount) {
        let parent = document.getElementById(parentName);
        let element = document.createElement(type);
        element.setAttribute("type", attribute["type"]);
        element.setAttribute("value", attribute["value"]);
        element.setAttribute("id", attribute["id"]);
        parent.appendChild(element);
        this.m_CreatedElementMap[attribute["id"]] = element;
        return element;
    }
    Create_Element_FindFunction(type, attribute, getParent, elementCount) {
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
function getReelIconElementName(reel_index, icon_index) {
    return reel_index + "_" + icon_index;
}
let m_creatElement = null;
let m_ReelGenerator = null;
window.onload = () => {
    let addReelButton = document.getElementById('addReelButton');
    addReelButton.onclick = function () {
        let reelCount = parseInt(document.getElementById("reel_count_input").value);
        let reelHeight = parseInt(document.getElementById("reel_height_input").value);
        let reelDisplayHeight = parseInt(document.getElementById("reel_display_height_input").value);
        let iconCount = parseInt(document.getElementById("icon_count_input").value);
        if (m_creatElement == null)
            m_creatElement = new Dynamically_create_element();
        if (m_ReelGenerator == null)
            m_ReelGenerator = new ReelGenerator(reelCount, reelHeight, reelDisplayHeight, iconCount);
        let reelParent = document.getElementById("reel_gen_div");
        for (let reelIndex = -1; reelIndex < reelCount; reelIndex++) {
            let reelUl = document.createElement("ul");
            let reelId;
            if (reelIndex == -1) {
                reelId = "iconIndexInfos";
            }
            else {
                reelId = "reel_" + reelIndex;
            }
            reelUl.id = reelId;
            let label = m_creatElement.Create_Element_FindFunction("label", ["", "", "reel_label_" + reelIndex], function () { return reelUl; }, 1);
            if (reelIndex == -1) {
                label.innerText = "iconIndex";
            }
            else {
                label.innerText = "reel" + reelIndex;
            }
            for (let iconIndex = 0; iconIndex < iconCount; iconIndex++) {
                let defaultValue = 0;
                if (reelIndex == -1)
                    defaultValue = iconIndex + 1;
                let iconLabel = m_creatElement.Create_Element_FindFunction("input", ["number", defaultValue.toString(), getReelIconElementName(reelIndex, iconIndex)], function () { return reelUl; }, 1);
                iconLabel.addEventListener("change", function (ev) { console.log(this.value + "," + this.id); });
            }
            reelParent.appendChild(reelUl);
        }
    };
    var runButton = document.getElementById('runButton');
    runButton.onclick = function () {
        if (m_creatElement == null)
            return;
        for (let reelIndex = 0; reelIndex < m_ReelGenerator.reelCount; reelIndex++) {
            for (let iconIndex = 0; iconIndex < m_ReelGenerator.iconCount; iconIndex++) {
                let reelIconCountInput = m_creatElement.m_CreatedElementMap[getReelIconElementName(reelIndex, iconIndex)];
                if (reelIconCountInput !== null && reelIconCountInput !== undefined) {
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