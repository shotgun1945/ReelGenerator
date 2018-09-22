class Reel {
//private ReelDisplayHeight:number = 3;       //TODO : 공통으로 변경
public GetIconInfoByIconId(iconId: number): IconInfo {
    let result: IconInfo = null;
    for (let index = 0; index < this.notSoredIconDataArray.length; index++) {
    const element = this.notSoredIconDataArray[index];
    if (element.iconInfo.iconId === iconId) {
        result = element.iconInfo;
        break;
    }
    }

    return result;
}
private sortedIconDataArray: Icon[];
private notSoredIconDataArray: Icon[];
private IconInfoArray: IconInfo[];
constructor(public index: number, public length: number) {
    this.sortedIconDataArray = new Array<Icon>(length);
    this.notSoredIconDataArray = new Array<Icon>(length);
    this.IconInfoArray = new Array<IconInfo>();
}

public setIconInfoArray(iconInfo: IconInfo[]) {
    iconInfo.forEach(element => {
    this.setIconInfo(element);
    });
}

public setIconInfo(iconInfo: IconInfo) {
    // for (let index = 0; index < iconCount; index++) {
    //     const icon = new Icon(iconInfo, stackCount, 0, this.index);
    //     this.iconPool[".push(icon);
    // }

    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < this.IconInfoArray.length; index++) {
    const element = this.IconInfoArray[index];
    if (element.IsSameIcon(iconInfo, true)) {
        return;
    }
    }
    this.IconInfoArray.push(iconInfo);
}

private isDuplicated(newIconInfo: IconInfo, currentIndex: number): boolean {
    let result = false;
    let checkLength = 1;
    if (newIconInfo.blockdSameDisplay) {
    checkLength = m_ReelDisplayHeight;
    }
    //TODO::Check StackSymbol
    for (let i = -checkLength; i <= checkLength; i++) {
    let index = CalculateIndexWithOffset(currentIndex, i, this.length);
    if (index === currentIndex) {
        continue;
    }
    if (
        this.sortedIconDataArray[index] === null ||
        this.sortedIconDataArray[index] === undefined
    ) {
        continue;
    }

    if (
        this.sortedIconDataArray[index].iconInfo.IsSameIcon(newIconInfo, false)
    ) {
        result = true;
        break;
    }
    }
    return result;
}

private GetNextStack(currentIndex: number): Array<IconInfo> {
    const resultArray: Array<IconInfo> = new Array<IconInfo>();
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
    const randomIndex =
        Math.round(Math.random() * 10000) % resultArray.length;

    const temp = resultArray[randomIndex];
    resultArray[randomIndex] = resultArray[0];
    resultArray[0] = temp;
    }
    return resultArray;
}

public generator(): Array<Icon> {
    let totalIconCount = 0;
    this.IconInfoArray.forEach(element => (totalIconCount += element.maxCount));
    if (totalIconCount === this.length) {
    this.FindNextIcon(0);
    } else {
    throw "IconCount is invalid : totalIconCOunt " +
        totalIconCount +
        " != length + " +
        length;
    }

    return this.sortedIconDataArray;
}

public FindNextIcon(currentIndex: number): boolean {
    if (currentIndex === this.length) return true;
    const stack: Array<IconInfo> = this.GetNextStack(currentIndex);
    let isSuccessed = false;
    console.log(currentIndex, " stack : ", PrintIconInfoArray(stack));

    for (let i: number = 0; i < stack.length; i++) {
    const element = stack[i];
    //ToDO: Add StackSymbol

    this.sortedIconDataArray[currentIndex] = new Icon(
        element,
        currentIndex,
        this.index
    );
    element.remainCount--;
    isSuccessed = this.FindNextIcon(currentIndex + 1);
    if (isSuccessed === true) {
        break;
    } else {
        element.remainCount++;
    }
    }

    if (!isSuccessed) {
    this.sortedIconDataArray[currentIndex] = null;
    }

    return isSuccessed;
}
}
