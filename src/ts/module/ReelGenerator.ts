function PrintIconArray(array: Array<Icon>): string {
  let resultString = "";
  array.forEach(element => {
    resultString += element.iconInfo.iconId + ", ";
  });
  return resultString;
}

function PrintIconInfoArray(array: Array<IconInfo>): string {
  let resultString = "";
  array.forEach(element => {
    resultString += element.iconId + ", ";
  });

  return resultString;
}

class ReelGenerator {
  constructor(private _reelCount:number, private _reelHeight:number, private _reelDisplayHeight:number, private _iconCount:number) {
    this.ReelInfoArray = new Array<Reel>();
    for (let i = 0; i < _reelCount; i++) {
      this.ReelInfoArray.push(new Reel(i, _reelHeight, _reelDisplayHeight));
    }
  }
  public ReelInfoArray:Array<Reel>;
  
  public get iconCount() : number {
    return this._iconCount;
  }
  
  public get reelCount(): number {
      return this._reelCount;
    }
  public set reelCount(value:number) {
      if(value > 0) this._reelCount = value;
    }
  /**
   * AddIconInfo
   */
  public SetIconInfo(reelIndex:number, infos:IconInfo[], overwrite:boolean) {
    if(this.ReelInfoArray.length <= reelIndex)
    {
      console.error("ReelInfoArray length is greater than input reel Index / length : "+this.ReelInfoArray.length + ", reelIndex : " + reelIndex);
      return;
    }
    if(overwrite)
    {
      this.ReelInfoArray[reelIndex].clearIconInfo();
    }
    this.ReelInfoArray[reelIndex].setIconInfoArray(infos);
  }
  // public AddReel(infos:IconInfo[]) {
  //   let id =this.ReelInfoArray.length + 1;
  //   new Reel(id, this.reelCount, this._reelDisplayHeight);
  //   this.ReelInfoArray.push()
  //   this.ReelInfoArray[].setIconInfoArray(infos);
  // }
  public testMain() {
    //TODO:TESTVALUE
  
    const reel = new Reel(0, 30, 3);
  
    const iconInfo1 = new IconInfo(1, 1, true , 0);
    const iconInfo2 = new IconInfo(2, 5);
    const iconInfo3 = new IconInfo(3, 8, false, -1);
    const iconInfo4 = new IconInfo(4, 8, false, -1);
    const iconInfo5 = new IconInfo(5, 8, false, -1);
    const iconInfoArray = [iconInfo1, iconInfo2, iconInfo3, iconInfo4, iconInfo5];
    reel.setIconInfoArray(iconInfoArray);
    let result: Array<Icon> = reel.generator();
    console.log(PrintIconArray(result));
    this.VerrifyResult(result, iconInfoArray);
  }

  public generator(){
    this.ReelInfoArray.forEach((reel:Reel)=>
    {
      reel.ClearGeneratedReelIconArray();
      reel.generator();
    });
  }

  public getAllIconInfo()
  {
    return this.ReelInfoArray.map(reel=>{return reel.SortedIconDataArray;});
  }
  
  public geAllIconInfoString()
  {
    let resultString="";
    this.ReelInfoArray.forEach(reel=>
      {
        resultString += reel.GetIconString();
        resultString += "<br/>"
      });
    return resultString;
  }
  
  public VerrifyResult(result: Array<Icon>, iconInfoArray: Array<IconInfo>) {
    let index = 0;
    while (index < result.length) {
      const icon = result[index];
      let stackCount = 1;
      while (index + stackCount < result.length) {
        if (result[index + stackCount].IsSameIcon(icon)) {
          stackCount++;
        } else {
          break;
        }
      }
  
      let iconInfo: IconInfo = null;
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
        for (let displayHeight = -this._reelDisplayHeight + 1 ; displayHeight < this._reelDisplayHeight;displayHeight++) 
        {
          if(displayHeight == 0)
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