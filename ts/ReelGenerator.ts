
class IconInfo      //공통 정보
{
    public remainCount:number = 0;
    constructor(public iconId:number, public maxCount:number, public iconFixposition: number = -1, public blockdSameDisplay:boolean = false, public stackCount:number = 1)
    {
        this.remainCount = maxCount;
    }

    /**
     * IsSameIcon
     */
    public IsSameIcon(targetIcon:IconInfo, compareStack:boolean = false):boolean {
        return this.iconId == targetIcon.iconId && (!compareStack || this.stackCount == targetIcon.stackCount);
    }
    /**
     * IsSameIcon
     */
    public IsThisIcon(iconId:number, stackCount:number):boolean {
        return this.iconId == iconId && this.stackCount == stackCount;
    }
}
class Icon
{
    constructor(public iconInfo:IconInfo, public dataIndex:number, public reelIndex:number)
    {

    }
    /**
     * IsSameIcon
     */
    public IsSameIcon(tartIcon:Icon) {
        return this.iconInfo.IsSameIcon(tartIcon.iconInfo, false);
    }
}
class Reel {
    private ReelDisplayHeight:number = 3;       //TODO : 공통으로 변경
    public GetIconInfoByIconId(iconId:number):IconInfo
    {
        var result:IconInfo = null;
        for (let index = 0; index < this.notSoredIconDataArray.length; index++) {
            const element = this.notSoredIconDataArray[index];
            if(element.iconInfo.iconId == iconId)
            {
                result = element.iconInfo;
                break;
            }
        }

        return result;
    }
    private sortedIconDataArray: Array<Icon> = null;
    private notSoredIconDataArray:Array<Icon>;
    private IconInfoArray:Array<IconInfo>;
    constructor(public index:number, public length: number)
    {
        this.sortedIconDataArray = new Array<Icon>(length);
        this.notSoredIconDataArray = new Array<Icon>(length);
        this.IconInfoArray = new Array<IconInfo>();
    }

    public setIconInfoArray(iconInfo:Array<IconInfo>)
    {
        iconInfo.forEach(element => {
            this.setIconInfo(element);
        });
    }

    public setIconInfo(iconInfo:IconInfo)
    {
        // for (let index = 0; index < iconCount; index++) {
        //     const icon = new Icon(iconInfo, stackCount, 0, this.index);
        //     this.iconPool[".push(icon);
        // }
        
        for (let index = 0; index < this.IconInfoArray.length; index++) {
            const element = this.IconInfoArray[index];
            if(element.IsSameIcon(iconInfo, true))
            {
                return;
            }
        }
        this.IconInfoArray.push(iconInfo);

    }

    public GetIndexWithOffset(currentIndex:number, offset:number, maxValue:number):number
    {
        let index = currentIndex + offset;
        if(index < 0)
        {
            index += maxValue;
        }
        if(index >= maxValue)
        {
            index -= maxValue;
        }
        return index;
    }

    private isDuplicated(newIconInfo:IconInfo, currentIndex:number):boolean
    {
        let result = false;
        let checkLength = 1;
        if(newIconInfo.blockdSameDisplay)
        {
            checkLength == m_ReelDisplayHeight;
        }
        //TODO::Check StackSymbol
        for (let i = -checkLength; i <= checkLength ; i++) {
            
            let index = this.GetIndexWithOffset(currentIndex, i, this.length);
            if(index == currentIndex)
            {
                continue
            }
            if(this.sortedIconDataArray[index] == null || this.sortedIconDataArray[index] == undefined)
            {
                continue;
            }
            
            if(this.sortedIconDataArray[index].iconInfo.IsSameIcon(newIconInfo, false))
            {
                result  = true;
                break;
            }
        }
        return result;
    }
    
    private GetNextStack(currentIndex:number):Array<IconInfo>
    {
        const resultArray:Array<IconInfo> = new Array<IconInfo>();
        this.IconInfoArray.forEach(element => 
        {
            if(element.remainCount <= 0)
            {
                return;
            }
            if(!this.isDuplicated(element, currentIndex))
            {
                resultArray.push(element);
            }
        });
        
        let loopCount =resultArray.length * 10;
        for (let index = 0; index < loopCount; index++) {
            const randomIndex = Math.round ((Math.random() * 10000)) % resultArray.length;

            const temp = resultArray[randomIndex];
            resultArray[randomIndex] = resultArray[0];
            resultArray[0] = temp;
        }
        return resultArray;

    }

    public generator():Array<Icon>
    {
        let totalIconCount =0;
        this.IconInfoArray.forEach(element=> totalIconCount+=element.maxCount);
        if(totalIconCount == this.length)
        {
            this.FindNextIcon(0);
        }
        else
        {
            throw "IconCount is invalid : totalIconCOunt "+ totalIconCount + " != length + " + length;
        }

        return this.sortedIconDataArray;
    }

    public FindNextIcon(currentIndex:number):boolean
    {
        if(currentIndex == this.length)
            return true;
        const stack:Array<IconInfo> = this.GetNextStack(currentIndex);
        let isSuccessed = false;
        console.log(currentIndex, " stack : ", PrintIconInfoArray(stack));
        
        for(let i:number = 0 ; i <stack.length ; i ++ )

        {   const element = stack[i];        
            //ToDO: Add StackSymbol
            
            this.sortedIconDataArray[currentIndex] = new Icon(element, currentIndex, this.index);
            element.remainCount--;
            isSuccessed = this.FindNextIcon(currentIndex + 1);
            if(isSuccessed == true)
            {
                break;
            }
            else
            {
                element.remainCount++;
            }
        };

        if(!isSuccessed)
        {
            this.sortedIconDataArray[currentIndex] = null;
        }

        return isSuccessed;
    }
}

var m_ReelCount = 0;// 릴 개수
// 릴 사이즈
// 아이콘 종류
// 릴별 아이콘 개수
var m_ReelDisplayHeight = 3;
function CheckWhile(whileCount:number, exception:string, RepeatFunction:Function, CheckFunc:Function)
{
    var whileRemainCount:number = whileCount;
    while (CheckFunc) {
        RepeatFunction();
        whileRemainCount--;
        if(whileRemainCount < 0)
        {
            break;
        }
        throw exception;
    }
}

function PrintIconArray(array:Array<Icon>):string
{
    let resultString ="";
    array.forEach(element=>{resultString += element.iconInfo.iconId +", "});
    return resultString;
}

function PrintIconInfoArray(array:Array<IconInfo>):string
{
    let resultString ="";
    array.forEach(element=>{resultString += element.iconId +", "});
    
    return resultString;
}

function main()
{
    //TODO:TESTVALUE
    
    const reel = new Reel(0, 30);

    const iconInfo1 = new IconInfo(1, 1);
    const iconInfo2 = new IconInfo(2, 5);
    const iconInfo3 = new IconInfo(3, 8, -1, false);
    const iconInfo4 = new IconInfo(4, 8, -1, false);
    const iconInfo5 = new IconInfo(5, 8, -1, false);
    const iconInfoArray = [iconInfo1, iconInfo2, iconInfo3, iconInfo4, iconInfo5];
    reel.setIconInfoArray(iconInfoArray);
    let result:Array<Icon> = reel.generator();
    console.log(PrintIconArray(result));
    VerrifyResult(result,iconInfoArray);
}

function VerrifyResult(result:Array<Icon>, iconInfoArray:Array<IconInfo>)
{
    let index = 0;
    while(index < result.length)
    {
        const icon = result[index];
        let stackCount = 1;
        while (index + stackCount <  result.length) {
            if(result[index + stackCount].IsSameIcon(icon))
            {
                stackCount++;
            }
            else
            {
                break;
            }
        }
        
        let iconInfo:IconInfo = null;
        iconInfoArray.forEach(element => {
            element.IsSameIcon(icon.iconInfo, true);
            iconInfo = element;
        });

        if(iconInfo == null)
        {
            throw "Icon Info is Not Founded "+index+", " + icon.iconInfo;
        }

        for (let stackIndex = 1; stackIndex < iconInfo.stackCount; stackIndex++) {
            const element = result[index + stackIndex];
            if(!element.IsSameIcon(icon))
            {
                throw "Stack Failed "+index+", " + icon.iconInfo;
            }
        }
        
        if(icon.iconInfo.blockdSameDisplay)
        {
            for (let displayHeight = 0; displayHeight < m_ReelDisplayHeight; displayHeight++) {
                let displayIndex = this.GetIndexWithOffset(index, displayHeight, m_ReelDisplayHeight);

                const element = result[displayIndex];
                
                if(element.IsSameIcon(icon))
                {
                    throw "BlockIcon Failed "+index+", " + icon.iconInfo;
                }
            }
        }
        
        index += stackCount;
    }

    console.log("Completed Verification");
    
}

main();
//TODO : STACk 심볼 , 심볼 그룹핑, 특정 심볼 고정위치
//