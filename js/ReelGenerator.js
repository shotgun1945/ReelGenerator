var IconInfo = (function () {
    function IconInfo(iconId, maxCount, iconFixposition, blockdSameDisplay, stackCount) {
        if (iconFixposition === void 0) { iconFixposition = -1; }
        if (blockdSameDisplay === void 0) { blockdSameDisplay = false; }
        if (stackCount === void 0) { stackCount = 1; }
        this.iconId = iconId;
        this.maxCount = maxCount;
        this.iconFixposition = iconFixposition;
        this.blockdSameDisplay = blockdSameDisplay;
        this.stackCount = stackCount;
        this.remainCount = 0;
        this.remainCount = maxCount;
    }
    IconInfo.prototype.IsSameIcon = function (targetIcon, compareStack) {
        if (compareStack === void 0) { compareStack = false; }
        return this.iconId == targetIcon.iconId && (!compareStack || this.stackCount == targetIcon.stackCount);
    };
    return IconInfo;
}());
var Icon = (function () {
    function Icon(iconInfo, dataIndex, reelIndex) {
        this.iconInfo = iconInfo;
        this.dataIndex = dataIndex;
        this.reelIndex = reelIndex;
    }
    return Icon;
}());
var Reel = (function () {
    function Reel(index, length) {
        this.index = index;
        this.length = length;
        this.ReelDisplayHeight = 3;
        this.sortedIconDataArray = null;
        this.sortedIconDataArray = new Array(length);
        this.notSoredIconDataArray = new Array(length);
    }
    Reel.prototype.GetIconInfoByIconId = function (iconId) {
        var result = null;
        for (var index = 0; index < this.notSoredIconDataArray.length; index++) {
            var element = this.notSoredIconDataArray[index];
            if (element.iconInfo.iconId == iconId) {
                result = element.iconInfo;
                break;
            }
        }
        return result;
    };
    Reel.prototype.setIconInfo = function (iconInfo) {
        var findResult = this.IconInfoArray.filter(function (value) {
            return value.IsSameIcon(iconInfo, true);
        });
        if (findResult.length == 0) {
            this.IconInfoArray.push(iconInfo);
        }
    };
    Reel.prototype.isDuplicated = function (newIconInfo, currentIndex) {
        var result = false;
        var checkLength = 1;
        if (newIconInfo.blockdSameDisplay) {
            checkLength == m_ReelDisplayHeight;
        }
        for (var i = -checkLength; i <= checkLength; i++) {
            var index = currentIndex + i;
            if (index < 0) {
                index += this.length;
            }
            if (index >= this.length) {
                index -= this.length;
            }
            if (index == currentIndex) {
                continue;
            }
            if (this.sortedIconDataArray.length <= index) {
                continue;
            }
            if (this.sortedIconDataArray[index].iconInfo.IsSameIcon(newIconInfo, false)) {
                result = true;
                break;
            }
        }
        return result;
    };
    Reel.prototype.GetNextStack = function (currentIndex) {
        var _this = this;
        var resultArray = new Array();
        this.IconInfoArray.forEach(function (element) {
            if (element.remainCount <= 0) {
                return;
            }
            if (!_this.isDuplicated(element, currentIndex)) {
                resultArray.push(element);
            }
        });
        for (var index = 0; index < 10000; index++) {
            var randomIndex = Math.random() * 10000 % resultArray.length;
            var temp = resultArray[randomIndex];
            resultArray[randomIndex] = resultArray[0];
            resultArray[0] = temp;
        }
        return resultArray;
    };
    Reel.prototype.generator = function () {
        var totalIconCount = 0;
        this.IconInfoArray.forEach(function (element) { return totalIconCount += element.maxCount; });
        if (totalIconCount == this.length) {
            this.FindNextIcon(0);
        }
        else {
            throw "IconCount is invalid : totalIconCOunt " + totalIconCount + " != length + " + length;
        }
        return this.sortedIconDataArray;
    };
    Reel.prototype.FindNextIcon = function (currentIndex) {
        if (currentIndex == this.length)
            return true;
        var stack = this.GetNextStack(currentIndex);
        var isSucessed = false;
        for (var i = 0; i < stack.length; i++) {
            var element = stack[i];
            this.sortedIconDataArray[currentIndex] = new Icon(element, currentIndex, this.index);
            isSucessed = this.FindNextIcon(currentIndex + 1);
            if (isSucessed == true) {
                break;
            }
        }
        ;
        return isSucessed;
    };
    return Reel;
}());
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
function main() {
    var reel = new Reel(0, 30);
    var iconInfo1 = new IconInfo(1, 1);
    var iconInfo2 = new IconInfo(2, 5);
    var iconInfo3 = new IconInfo(3, 8, -1, false);
    var iconInfo4 = new IconInfo(4, 8, -1, false);
    var iconInfo5 = new IconInfo(5, 8, -1, false);
    reel.setIconInfo(iconInfo1);
    reel.setIconInfo(iconInfo2);
    reel.setIconInfo(iconInfo3);
    reel.setIconInfo(iconInfo4);
    reel.setIconInfo(iconInfo5);
    var result = reel.generator();
    console.log(result);
}
main();
