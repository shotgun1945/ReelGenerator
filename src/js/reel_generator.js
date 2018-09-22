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
    constructor(index, length) {
        this.index = index;
        this.length = length;
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
    setIconInfoArray(iconInfo) {
        iconInfo.forEach(element => {
            this.setIconInfo(element);
        });
    }
    setIconInfo(iconInfo) {
        for (let index = 0; index < this.IconInfoArray.length; index++) {
            const element = this.IconInfoArray[index];
            if (element.IsSameIcon(iconInfo, true)) {
                return;
            }
        }
        this.IconInfoArray.push(iconInfo);
    }
    isDuplicated(newIconInfo, currentIndex) {
        let result = false;
        let checkLength = 1;
        if (newIconInfo.blockdSameDisplay) {
            checkLength = m_ReelDisplayHeight;
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
    GetNextStack(currentIndex) {
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
    FindNextIcon(currentIndex) {
        if (currentIndex === this.length)
            return true;
        const stack = this.GetNextStack(currentIndex);
        let isSuccessed = false;
        console.log(currentIndex, " stack : ", PrintIconInfoArray(stack));
        for (let i = 0; i < stack.length; i++) {
            const element = stack[i];
            this.sortedIconDataArray[currentIndex] = new Icon(element, currentIndex, this.index);
            element.remainCount--;
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
        return isSuccessed;
    }
}
var m_ReelCount = 0;
var m_ReelDisplayHeight = 3;
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
function main() {
    const reel = new Reel(0, 30);
    const iconInfo1 = new IconInfo(1, 1);
    const iconInfo2 = new IconInfo(2, 5);
    const iconInfo3 = new IconInfo(3, 8, false, -1);
    const iconInfo4 = new IconInfo(4, 8, false, -1);
    const iconInfo5 = new IconInfo(5, 8, false, -1);
    const iconInfoArray = [iconInfo1, iconInfo2, iconInfo3, iconInfo4, iconInfo5];
    reel.setIconInfoArray(iconInfoArray);
    let result = reel.generator();
    console.log(PrintIconArray(result));
    VerrifyResult(result, iconInfoArray);
}
function VerrifyResult(result, iconInfoArray) {
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
            for (let displayHeight = 0; displayHeight < m_ReelDisplayHeight; displayHeight++) {
                let displayIndex = CalculateIndexWithOffset(index, displayHeight, m_ReelDisplayHeight);
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
main();
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
//# sourceMappingURL=reel_generator.js.map