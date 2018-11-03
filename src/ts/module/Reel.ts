class Reel 
{
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
    constructor(public index: number, public length: number, public reelDisplayHeight:number) {
        this.sortedIconDataArray = new Array<Icon>(length);
        this.notSoredIconDataArray = new Array<Icon>(length);
        this.IconInfoArray = new Array<IconInfo>();
    }

    public setIconInfoArray(iconInfos: IconInfo[]) {
        iconInfos.forEach(iconInfo => {
            const sameIcon = this.IconInfoArray.find(element => element.IsSameIcon(iconInfo, true));
            if(sameIcon != null)
            {
                return;
            }
            if(iconInfo.iconFixposition >= 0)
            {
                const fixPosition = iconInfo.iconFixposition;
                this.SetIconInIndex(iconInfo, fixPosition, true);
            }
            this.IconInfoArray.push(iconInfo);
        });
    }

    private isDuplicated(newIconInfo: IconInfo, currentIndex: number): boolean {
        let result = false;
        let checkLength = 1;
        if (newIconInfo.blockdSameDisplay) {
            checkLength = this.reelDisplayHeight;
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

    private GetNextList(currentIndex: number): Array<IconInfo> {
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
        for (let index = 0; index < loopCount; index++) 
        {
            const randomIndex = Math.round(Math.random() * 10000) % resultArray.length;

            const temp = resultArray[randomIndex];
            resultArray[randomIndex] = resultArray[0];
            resultArray[0] = temp;
        }
        return resultArray;
    }

    public generator(): Array<Icon> 
    {
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

    public SetIconInIndex(iconInfo:IconInfo, currentIndex:number, decereaseRemainCount:boolean)
    {
        if(this.sortedIconDataArray[currentIndex] != null){
            console.log("seticoninIndex erreor position " + currentIndex+ "is not null " );
        }
        this.sortedIconDataArray[currentIndex] = new Icon(
            iconInfo,
            currentIndex,
            this.index
        );
        if(decereaseRemainCount){
            iconInfo.remainCount--;
        }

    }

    public FindNextIcon(currentIndex: number): boolean {
        if (currentIndex === this.length) return true;
        let isSuccessed = false;
        if(this.sortedIconDataArray[currentIndex] == null)
        {
            const currentlist: Array<IconInfo> = this.GetNextList(currentIndex);
            console.log(currentIndex, " currentlist : ", PrintIconInfoArray(currentlist));
    
            for (let i: number = 0; i < currentlist.length; i++) 
            {
                const element = currentlist[i];
                //ToDO: Add StackSymbol
    
                this.SetIconInIndex(element, currentIndex, true);
                isSuccessed = this.FindNextIcon(currentIndex + 1);
                if (isSuccessed === true) {
                    break;
                } 
                else 
                {
                    element.remainCount++;
                }
            }

            if (!isSuccessed) {
                this.sortedIconDataArray[currentIndex] = null;
            }
        }
        else
        {
            isSuccessed = this.FindNextIcon(currentIndex + 1);
        }

        return isSuccessed;
    }
}
